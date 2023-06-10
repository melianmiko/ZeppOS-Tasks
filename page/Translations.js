import { loadLocale } from "../lib/mmk/i18n";

import {russianStrings} from "./translations/ru-RU";
import {englishStrings} from "./translations/en-US";
import {chineseStrings} from "./translations/zh-CN";

/**
 * Locale contents was split into separate files and saved into
 * `translations` folder. If you want to contribute translation
 * for some locale, please refer to them.
 */

loadLocale("en-US", englishStrings);
loadLocale("ru-RU", russianStrings);
loadLocale("zh-CN", chineseStrings);
