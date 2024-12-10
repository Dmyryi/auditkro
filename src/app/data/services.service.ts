import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Интерфейсы для типизации
interface Violation {
  controlzone: string;
  controlelement: string;
  reasonclassifier: string;
  foto: string;
}

interface AuditData {
  erpguid: string;
  erpdata: {
    storepoint: string;
    auditor: string;
    director: string;
    manager: string;
    violationarray: Violation[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private baseUrl =
    'https://search-ospizzaday-53crzkzjrv22mjjfuz5txdqxrq.eu-central-1.es.amazonaws.com/controldepartmentauditdata/_search';
  private uploadUrl =
    'https://x4kr2l4ru8.execute-api.us-west-2.amazonaws.com/uploadkrophoto';

  private authHeader = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + btoa('pizzaday:J@tAa2aUCN6Uehax'),
  });
  httpClient: any;

  constructor(private http: HttpClient) {}

  // Получение данных об аудите

  getAuditData(auditId: string): Observable<any> {
    const query = {
      size: 300,
      query: {
        match_phrase: {
          _id: auditId,
        },
      },
    };
    return this.http.post<any>(this.baseUrl, query, {
      headers: this.authHeader,
    });
  }

  uploadPhoto(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.uploadUrl}`, formData, {
      observe: 'response',
    });
  }

  getIndexPhoto(): Observable<any> {
    const body = {
      size: 300,
      query: {
        match_all: {},
      },
    };

    return this.http.post(
      `https://search-ospizzaday-53crzkzjrv22mjjfuz5txdqxrq.eu-central-1.es.amazonaws.com/krofotoresultaftercheck/_search`,
      body,
      { headers: this.authHeader }
    );
  }

  // Индексация информации о фотографии в Elasticsearch
  indexPhotoData(
    guid: string,
    rownumber: string,
    photoUrl: string[]
  ): Observable<any> {
    const body = {
      guid,

      row: rownumber,
      link: photoUrl,

      date: new Date().toISOString(),
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(
      'https://search-ospizzaday-53crzkzjrv22mjjfuz5txdqxrq.eu-central-1.es.amazonaws.com/krofotoresultaftercheck/_doc',
      body,
      {
        headers: this.authHeader,
      }
    );
  }
}
// https://search-ospizzaday-53crzkzjrv22mjjfuz5txdqxrq.eu-central-1.es.amazonaws.com/controldepartmentauditdataphoto/_doc/b7a0f35e-b6ee-11ee-91e3-00155d45d204 --получени загрузного фото с эластика
