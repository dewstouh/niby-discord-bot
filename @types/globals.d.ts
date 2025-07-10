export {};

declare global {
   interface String {
      isValidUrl(): boolean;
      capitalizeFirstChar(): string;
      removeLastChar(): string;
      toCamelCase(): string;
      toPascalCase(): string;
      toSnakeCase(): string;
      escape(): string;
   }

   interface Console {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      success(...args: any[]): void;
      square(...args: any[]): void;
   }

   interface Number {
      random(minPercentage?: number, maxPercentage?: number): number;
   }

   interface Object {
      isValid(): boolean;
      isEqual(otherObject:object): boolean;
   }

   interface Array<T> {
      random(): T;
      shuffle(): T[];
      move<T>(srcIndex: number, destinyIndex: number): T[]
   }
}
