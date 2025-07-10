import Client from './Client';
import { Category } from './Category';
import LocaleUtils from './utils/LocaleUtils';
import { Locale } from '../typings/locales';
interface Options {
   name: string;
   parentCategory: Category;
   langKey?: string;
}

export class SubCategory extends Category {
   PARENT_CATEGORY: Category;
   DEFAULT_KEY: string;
   KEY: string;
   constructor(
      client: Client,
      options: Options,
   ) {
      const { parentCategory } = options;
      const catName = options.name;
      options.langKey = `CATEGORIES.${parentCategory.DEFAULT_NAME}.${options.name}`
      options.name = `${parentCategory.DEFAULT_NAME} ${catName}`
      super(client, options)
      this.PARENT_CATEGORY = parentCategory;
      this.DEFAULT_KEY = this.DEFAULT_NAME;
      this.KEY = `${this.PARENT_CATEGORY.NAME} ${this.NAME}`;
      if(!parentCategory.getSubCategory(options.name)) parentCategory.addSubCategory(this);
   }

   getKey(language:Locale = process.env.LANGUAGE){
      return this.PARENT_CATEGORY ? `${this.PARENT_CATEGORY.getName(language)} ${LocaleUtils.inlineLocale(language, `${this.LANG_KEY}.NAME`)}` : `${LocaleUtils.inlineLocale(language, `${this.LANG_KEY}.NAME`)}`;
   }

}
