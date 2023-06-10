import { loadLocale } from "../lib/mmk/i18n";

import {strings as russianStrings} from "./translations/ru-RU";
import {strings as englishStrings} from "./translations/en-US";
import {strings as chineseStrings} from "./translations/zh-CN";

/**
 * Locale contents was split into separate files and saved into
 * `translations` folder. If you want to contribute translation
 * for some locale, please refer to them.
 *
 * You also could submit your translations with Crodin platform:
 * https://crowdin.com/project/zepptasks
 */

loadLocale("en-US", englishStrings);
loadLocale("ru-RU", russianStrings);
loadLocale("zh-CN", chineseStrings);
