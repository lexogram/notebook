/**
 * This script creates a global Hack object containing methods that
 * can be used to work around problems that theoretically should not 
 * occur.
 */

"use strict"

var Hack

;(function hack(){

  Hack = {
    /** http://stackoverflow.com/a/36806402/1927589 **/
    getCSSRule: function getCSSRule(ruleName) {
      ruleName = ruleName.toLowerCase();
      var result = null;
      var find = Array.prototype.find;

      find.call(document.styleSheets, styleSheet => {
        result = find.call(styleSheet.cssRules, cssRule => {
          return cssRule instanceof CSSStyleRule 
              && cssRule.selectorText.toLowerCase() == ruleName;
        });
        return result != null;
      });
      return result;
    }

    /**
     * SOURCE: Called by panel_modifyDOM in the panels script, when
     *         an iFrame is created. Without this hack, iFrames with
     *          a src of"https://www.wiktionary.org/" show an
     *          incorrect vertical offset although other remote
     *          URLs work well without the hack.
     * ACTION: Removes the given property from the CSS rule identified
     *         by the given selector, then restores it after a delay
     * FIXES:  Chrome 52.0.2743.116
     * FIXED:  Chrome 53.0.2785.101
     * @param  {string}  selector CSS selector such as "div#myID p" to
     *                            identify a CSS style declaration
     * @param  {string}  property CSS property such as "position"
     * @param  {integer} delay    integer milliseconds after which the
     *                            property of the given CSS style
     *                            declaration will be restored.
     **/
  , tweakCSSDeclaration: function (selector, property, delay) {
      var rule = this.getCSSRule(selector)
      var style
        , value

      if (rule) {
        style = rule.style
        value = style.getPropertyValue(property)
        style.removeProperty(property)

        setTimeout(function () {
          style.setProperty(property, value)
        }, delay||1)
      }

    }
  }
})()