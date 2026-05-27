import { AbstractControl, FormGroup } from '@angular/forms';

export function hasControlError(form: FormGroup, controlName: string, errorName: string): boolean {
  const control: AbstractControl | null = form.get(controlName);

  if (!control) {
    return false;
  }

  return control.hasError(errorName) && (control.touched || control.dirty);
}

export function markFormAsTouched(form: FormGroup): void {
  form.markAllAsTouched();
}
