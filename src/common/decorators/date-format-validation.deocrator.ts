import { registerDecorator, ValidationArguments } from 'class-validator';
import { ValidationOptions } from 'joi';

export function IsFormattedDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFormattedDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false; // Return false for invalid formats
          }
          // You can add additional checks here, e.g., checking if it's a valid date
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be in YYYY-MM-DD format`;
        },
      },
    });
  };
}
