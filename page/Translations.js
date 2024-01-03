import { loadLocale } from "../lib/mmk/i18n";

import {strings as englishStrings} from "./translations/en-US";
import {strings as russianStrings} from "./translations/ru-RU";
import {strings as germanStrings} from "./translations/de-DE";
import {strings as chineseStrings} from "./translations/zh-CN";
import {strings as hungarianStrings} from "./translations/hu-HU";
import {strings as italianStrings} from "./translations/it-IT";
import {strings as frenchStrings} from "./translations/fr-FR";
import {strings as spanishStrings} from "./translations/es-ES";
import {strings as brazilianStrings} from "./translations/pt-BR";

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
loadLocale("de-DE", germanStrings);
loadLocale("zh-CN", chineseStrings);
loadLocale("hu-HU", hungarianStrings);
loadLocale("it-IT", italianStrings);
loadLocale("fr-FR", frenchStrings);
loadLocale("es-ES", spanishStrings);
loadLocale("pt-BR", brazilianStrings);
