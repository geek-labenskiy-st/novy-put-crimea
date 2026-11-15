# JS-модули «Новый Путь»

Все модули — самовызывающиеся IIFE (`(function(){...})()`), `'use strict'`.
Общаются через общий объект `window.NP` (namespace).

## Порядок подключения в `index.html` (строгий!)

```html
<script src="js/01-utils.js"></script>
<script src="js/02-season.js"></script>
<script src="js/03-modal.js"></script>
<script src="js/04-legal.js"></script>
<script src="js/05-games.js"></script>
<script src="js/06-tools-core.js"></script>
<script src="js/07-tool-urge.js"></script>
<script src="js/08-tool-triggers.js"></script>
<script src="js/09-tool-sober.js"></script>
<script src="js/10-form.js"></script>
<script src="js/11-scroll.js"></script>
<script src="js/12-reveal.js"></script>