import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Payment,
  ProcessPaymentRequest,
  RazorpayOrderRequest,
  RazorpayOrderResponse,
  RazorpayVerifyRequest
} from '@shared/models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  process(request: ProcessPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/process`, request);
  }

  createRazorpayOrder(request: RazorpayOrderRequest): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(`${this.apiUrl}/razorpay/order`, request);
  }

  verifyRazorpayPayment(request: RazorpayVerifyRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/razorpay/verify`, request);
  }
}
