import { ApiCallService } from './../../services/api-call.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { emptyCity } from 'src/app/types/constants';
import { City } from 'src/app/types/types';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  constructor(private apiCallService: ApiCallService) {}

  citiesForm: FormGroup;
  citiesResponse: City[] = emptyCity;
  searchPlaceholder = 'Type to search for a German city by "Name"';
  isResponse = false;
  warningMessage: string;
  errorMessage: string;
  isLoading = false;

  ngOnInit() {
    this.citiesForm = new FormGroup({
      searchValueControl: new FormControl(undefined, Validators.required),
      searchValueTypeControl: new FormControl('byName'),
    });
  }

  onSubmit() {
    this.isLoading = true;
    const searchValue = this.citiesForm.get('searchValueControl')?.value;
    const searchValueType = this.citiesForm.get(
      'searchValueTypeControl'
    )?.value;
    const url = `${searchValueType}/${searchValue}`;

    if (!searchValue) {
      this.apiCallService.getCities().subscribe({
        next: (cities) => {
          this.warningMessage =
            'We are displaying all city results, you need to enter text to search';
          this.responseHandle(cities);
        },
        error: (errMsg) => {
          this.errorHandle(errMsg);
        },
      });
    } else {
      this.apiCallService.getCitiesBy(url).subscribe({
        next: (cities) => {
          this.responseHandle(cities);
          this.warningMessage = null;
        },
        error: (errMsg) => {
          this.errorHandle(errMsg);
        },
      });
    }
  }

  onChangeSearchType(event: Event) {
    this.citiesForm.patchValue({
      searchValueTypeControl: (event.target as HTMLInputElement).value,
    });
    const searchValueType = (event.target as HTMLInputElement).value;
    this.searchPlaceholder = `Type to search for a German city ${this.searchTypeToText(
      searchValueType
    )}`;
  }

  onTextInputChange(event: Event) {
    this.citiesForm.patchValue({
      searchValueControl: (event.target as HTMLInputElement).value,
    });
  }

  responseHandle(cities: City[]) {
    this.isLoading = false;
    this.citiesResponse = cities;
    this.isResponse = true;
    this.errorMessage = null;
  }

  errorHandle(errorMessage: string) {
    this.isLoading = false;
    this.isResponse = false;
    this.errorMessage =
      errorMessage === undefined
        ? 'Cannot communicate with the server'
        : errorMessage; //To handle server down
    throw this.errorMessage;
  }

  searchTypeToText(type: string): string {
    switch (type) {
      case 'byName':
        return 'by "Name"';
      case 'byUuid':
        return 'by "Uuid"';
      case 'byCount':
        return 'by "Count"';
      default:
        return '';
    }
  }
}
