import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Staff } from '../models/staff.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private firestore: Firestore = inject(Firestore);
  private staffCollection = collection(this.firestore, 'staff');

  constructor() {}

  getStaff(): Observable<Staff[]> {
    return collectionData(this.staffCollection, { idField: 'id' }) as Observable<Staff[]>;
  }

  async addStaff(staff: Staff) {
    return addDoc(this.staffCollection, staff);
  }

  async updateStaff(staff: Staff) {
    if (!staff.id) return;
    const docRef = doc(this.firestore, `staff/${staff.id}`);
    const { id, ...data } = staff;
    return updateDoc(docRef, data as any);
  }

  async deleteStaff(id: string) {
    const docRef = doc(this.firestore, `staff/${id}`);
    return deleteDoc(docRef);
  }
}
