"use strict";

/**
 * Theme demo module.
 *
 * @module theme
 */

/**
 * Theme rendering options.
 *
 * @typedef {Object} ThemeOptions
 * @property {string} [locale=en] Locale code.
 * @property {boolean} [excited=false] Adds punctuation to the rendered text.
 */

/**
 * Stateful theme renderer.
 *
 * @class
 * @classdesc Wraps the demo rendering function for class rendering coverage.
 * @param {ThemeOptions} [options] Default rendering options.
 */
class ThemeRenderer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Render a message.
   *
   * @param {string} name Display name.
   * @returns {string} Rendered message.
   */
  render(name) {
    return themeDemo(name, this.options);
  }
}

/**
 * Theme demo function.
 *
 * @function themeDemo
 * @param {string} name Display name.
 * @param {ThemeOptions} [options] Rendering options.
 * @returns {string} Demo text.
 * @example <caption>Basic rendering</caption>
 * // @coderef THEME_DEMO_BODY
 * @coderef THEME_DEMO_BODY
 * @hiaKey theme.demo
 * @lang zh-CN 主题演示函数。
 * @lang en Theme demo function.
 */
function themeDemo(name, options = {}) {
  /* @codeblock THEME_DEMO_BODY */
  const locale = options.locale || "en";
  const message = locale === "zh-CN" ? `你好，${name}` : `Hello, ${name}`;
  return options.excited ? `${message}!` : message;
  /* @codeblockend THEME_DEMO_BODY */
}

module.exports = {
  ThemeRenderer,
  themeDemo
};
