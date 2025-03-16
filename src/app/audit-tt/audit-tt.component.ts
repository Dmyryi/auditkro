import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicesService } from '../data/services.service';
import { HttpHeaders } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-audit-tt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-tt.component.html',
  styleUrls: ['./audit-tt.component.scss'],
})
export class AuditTtComponent implements OnInit {
  auditData: any = [];

  photoData: any = [];
  isLoading: boolean = false;
  auditId: string = '';
  photoUrl: string[] = []; // Фото, которое мы смотрим или загружаем
  originalPhoto: string = ''; // Исходное фото, которое не изменяется
  isUploading: boolean = false;

  currentViolation: any = [];
  modalOpen: boolean = false;
  filteredPhotos: any = null;
  intervalId: any = null;
  isLightboxOpen: boolean = false;
  photoViolationCurrent: string = '';

  violationsUploadState: { [key: string]: boolean } = {};

  openLightbox(photoUrl: string): void {
    this.photoViolationCurrent = photoUrl;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
  }

  openModal(violation: any): void {
    this.currentViolation = violation;
    this.originalPhoto = violation.foto;
    this.filteredPhotos = this.photoData.filter((photo: any) => {
      const photoRowNumber = Number(photo.rownumber || photo.row);
      const violationRowNumber = Number(this.currentViolation?.rownumber);

      return photoRowNumber === violationRowNumber;
    });

    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.currentViolation = null;
  }

  constructor(
    private router: ActivatedRoute,
    private service: ServicesService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.router.paramMap.subscribe((params) => {
      this.auditId = params.get('id') || '';
      this.loadAuditData();
      this.loadPhotoData();
      this.loadUploadStateFromLocalStorage();
    });
  }

  // Функция для просмотра фото (показываем новое фото)

  // Загружаем данные аудита
  loadAuditData(): void {
    this.service.getAuditData(this.auditId).subscribe(
      (data) => {
        this.auditData = data.hits.hits[0]._source;
        this.isLoading = false;
        console.log(this.auditData);
      },
      (error) => {
        console.error('Error loading audit data:', error);
        this.isLoading = false;
      }
    );
  }

  loadPhotoDataFirst(): void {}

  loadPhotoData(): void {
    this.service.getIndexPhoto(this.auditId).subscribe(
      (data) => {
        if (data.hits && data.hits.hits.length > 0) {
          // Преобразуем полученные данные
          this.photoData = data.hits.hits.map((hit: any) => hit._source);

          console.log('Данные обновлены');
        } else {
          console.log('Нет данных для фото.');
          this.filteredPhotos = []; // Очищаем список, если данных нет
        }
      },
      (error) => {
        console.error('Ошибка при загрузке данных фото:', error);
        this.filteredPhotos = [];
      }
    );
  }

  // Метод для глубокого сравнения данных
  isEqual(oldData: any[], newData: any[]): boolean {
    return JSON.stringify(oldData) === JSON.stringify(newData);
  }

  loadUploadStateFromLocalStorage(): void {
    const savedState = localStorage.getItem(
      `violationsUploadState_${this.auditId}`
    );
    if (savedState) {
      this.violationsUploadState = JSON.parse(savedState);
    }
  }

  // Загрузка фото
  uploadPhoto(event: any, violation: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const files = Array.from(input.files);

      const validFiles = files.filter((file) => file.size <= 6 * 1024 * 1024);
      if (validFiles.length !== files.length) {
        alert(
          'Один або декілька файлів надто великі. Максимальний розмір - 6 МБ.'
        );
      }

      const formData = new FormData();
      validFiles.forEach((file) => {
        const fileName = `${this.auditId}_${
          violation.rownumber
        }_${uuidv4()}.jpg`;
        formData.append('file', file, fileName);
      });

      violation.isUploading = true;
      this.isUploading = true;
      this.violationsUploadState[violation.rownumber] = false;

      this.service.uploadPhoto(formData).subscribe(
        (response: any) => {
          const uploadedUrl = response.body.urls;
          this.isUploading = false;

          // Обновляем фото для конкретного нарушения
          this.service
            .indexPhotoData(this.auditId, violation.rownumber, uploadedUrl)
            .subscribe(
              () => {
                this.violationsUploadState[violation.rownumber] = true;
                this.saveUploadStateToLocalStorage();
                // Обновляем только фотографии текущего нарушения
                this.filteredPhotos.push({ link: uploadedUrl });
              },
              (error) => {
                console.error('Ошибка при индексации фото:', error);
                this.violationsUploadState[violation.rownumber] = false;
              }
            );
        },
        (error) => {
          alert(
            'Помилка максимальний розмір файлу/файлів 6МБ. Спробуйте додати 1 файл'
          );
          violation.isUploading = false;
          this.violationsUploadState[violation.rownumber] = false;
        }
      );
    }
  }

  saveUploadStateToLocalStorage(): void {
    localStorage.setItem(
      `violationsUploadState_${this.auditId}`,
      JSON.stringify(this.violationsUploadState)
    );
  }
}
