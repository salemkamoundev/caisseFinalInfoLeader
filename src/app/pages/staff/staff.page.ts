import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, pencilOutline, trashOutline, menuOutline } from 'ionicons/icons';
import { StaffService } from 'src/app/services/staff.service';
import { Staff } from 'src/app/models/staff.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonMenuButton]
})
export class StaffPage implements OnInit {
  
  staff$: Observable<Staff[]>;
  
  currentStaff: Staff = { name: '', role: 'Serveur', active: true };
  isEditing = false;

  constructor(private staffService: StaffService) {
    addIcons({ arrowBackOutline, pencilOutline, trashOutline, menuOutline });
    this.staff$ = this.staffService.getStaff();
  }

  ngOnInit() {}

  async save() {
    if (!this.currentStaff.name) return;

    if (this.isEditing) {
      await this.staffService.updateStaff(this.currentStaff);
    } else {
      await this.staffService.addStaff(this.currentStaff);
    }
    this.cancelEdit();
  }

  edit(staff: Staff) {
    this.currentStaff = { ...staff };
    this.isEditing = true;
  }

  async delete(id: string) {
    if (confirm('Supprimer ce membre ?')) {
      await this.staffService.deleteStaff(id);
    }
  }

  cancelEdit() {
    this.currentStaff = { name: '', role: 'Serveur', active: true };
    this.isEditing = false;
  }
}
