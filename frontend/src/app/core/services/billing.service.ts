import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Bill, GenerateBillRequest } from '@shared/models/bill.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private apiUrl = `${environment.apiUrl}/billing`;
  private tariffConfig: Record<string, { basic: number; rate: number }> = {
    standard: { basic: 50, rate: 5 },
    premium: { basic: 75, rate: 6 },
    commercial: { basic: 100, rate: 7 }
  };

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.apiUrl);
  }

  getById(id: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.apiUrl}/${id}`);
  }

  getByCustomer(customerId: string): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  generate(request: GenerateBillRequest): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/generate`, request);
  }

  updateStatus(id: string, status: string): Observable<Bill> {
    return this.http.put<Bill>(`${this.apiUrl}/${id}`, { status });
  }

  calculateCharges(units: number, tariffPlan: 'standard' | 'premium' | 'commercial' = 'standard', discount = 0): { basic: number; rate: number; usage: number; tax: number; discount: number; total: number } {
    const tariff = this.tariffConfig[tariffPlan] || this.tariffConfig['standard'];
    const basic = tariff.basic;
    const rate = tariff.rate;
    const usage = units * rate;
    const tax = (basic + usage) * 0.1;
    const normalizedDiscount = Math.max(0, discount || 0);
    const total = Math.max(0, basic + usage + tax - normalizedDiscount);
    return {
      basic,
      rate,
      usage,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(normalizedDiscount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
}
