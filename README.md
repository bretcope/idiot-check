# Idiot Check

A chrome extension which allows you to apply different CSS to pages based on their url. The primary intended purpose is to remind you which environment you are working in (i.e. local, development, production), but its implementation is generalized and could be used for many other purposes.

## Installation

_Idiot Check_ will be in the Chrome Web Store soon. Until then, you can install it in development mode.

1. Download or clone this repository into a local directory, such as `c:\github\idiot-check`
1. In chrome, navigate to [chrome://extensions/](chrome://extensions/)
1. Check the "developer mode" checkbox.
1. Click "Load unpacked extension..." and select the directory of the repository.
1. Check the "Allow in incognito" box, if desired (recommended - nothing in this extension tracks you in any way).

## Options Page (Modes Configuration)

To configure _Idiot Check_, go to [chrome://extensions/](chrome://extensions/) and click the "options" link under the Idiot Check extension. From this page, you will be able to add/edit/remove modes. All edits are immediate (no saving required), however, web pages will need to be refreshed to see the results of any changes to modes.

### Modes

Each mode has a label, a list of url expressions, and CSS and/or JavaScript which will be injected into the page when one of the url expressions matches the url of a web page. Modes can also be enabled or disabled by clicking the "power" icon next to the name of each mode.

### URL Expressions

Each url must be a complete url in the form of a regular expression. For example, if you'd like to match both http and https versions of a website, you need to include that in the expression. For example `https?://www.google.com.*`. Don't forget to add the `.*` at the end if you want to match all paths on the domain. _The syntax of regular expressions is beyond the scope of this document. For more information, see the [Mozilla Regular Expressions Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)._

If the first character of a url expression is `!`, it will be treated as an exclude. This means that if this url expression matches the current web page, no CSS or JavaScript will be injected into the page, even if another url expression also matched.

### CSS and JavaScript Injection Notes

Currently, the CSS and JS are injected at or near the time the web page document begins to load. Eventually this timing should be configurable.

Due to Chrome's security model, JavaScript injected by an extension can interact with the DOM, but not with any other JavaScript which may be loaded on the page (including any other extensions).

There are three images which can be referenced using CSS, they are `EXTENSION:local.png`, `EXTENSION:development.png`, and `EXTENSION:production.png`. Examples of their usage can be seen in the default modes. Other images can be used by specifying an absolute url to an external image, as long as the external image allows hot-linking.

## Usage

On web pages which match an enabled mode, a unicorn icon will be shown in the right corner of the address bar. Click to icon to enable/disable _idiot check_. This will cause the current page to refresh, however, the setting will not be applied to any other open tab until the next time each one is refreshed.

## Alpha Software Disclaimer

This extension is new, and may not be stable. Use at your own risk. Report bugs in the github issue tracker. More features should be coming soon.