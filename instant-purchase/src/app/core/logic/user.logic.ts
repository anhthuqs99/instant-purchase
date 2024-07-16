import { environment } from '@environment';
import {
  AbstractControl,
  AbstractControlOptions,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
const invalidEmailRegex = new RegExp(
  `^[a-z0-9._%+-]+@(microsoft|outlook|skype|live|hotmail|yahoo)(.[a-z]{2,3}){1,2}`,
);

export class UserValidator {
  // email
  private emailValidator: InputValidatorInfo = {
    validators: [
      Validators.required,
      Validators.pattern(environment.emailRegex),
    ],
    errors: [
      { code: 'required', description: 'Email is required' },
      { code: 'pattern', description: 'Email is invalid' },
    ],
  };

  getEmailValidator(): InputValidatorInfo {
    return Object.create(this.emailValidator);
  }

  emailEditingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return invalidEmailRegex.test(control.value)
        ? { unsupported: true }
        : null;
    };
  }

  // alias
  private aliasValidator: InputValidatorInfo = {
    validators: [
      Validators.minLength(parseInt(environment.aliasMinLength)),
      Validators.maxLength(parseInt(environment.aliasMaxLength)),
    ],
    errors: [
      {
        code: 'minlength',
        description: `length of alias should be equal or greater than ${environment.aliasMinLength}`,
      },
      {
        code: 'maxlength',
        description: `length of alias should be equal or less than ${environment.aliasMaxLength}`,
      },
      { code: 'pattern', description: `this alias is invalid` },
    ],
  };

  getAliasValidator(): InputValidatorInfo {
    return Object.create(this.aliasValidator);
  }
}

export class InputValidatorInfo {
  control?: AbstractControl;
  validators: ValidatorFn | ValidatorFn[] | AbstractControlOptions = [];
  errors: FormInputError[] = [];
}

export class FormInputError {
  code?: string;
  description?: string;
}
