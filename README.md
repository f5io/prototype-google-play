# Google Prototype 2014

Hopefully, most of the code is commented well enough for you to work you way through this beast.

### Installation

You will need `node.js` installed to work with this project.

Please run `npm install`. After this is complete, run `gulp` in the root directory.

This will start a server running on `localhost` on port `4000`.

### Branches

There are currently 3 branches to this repo:

- `master` - The `master` branch contains a setup for gamified cubes with no content on each side apart from backgrounds.
- `play` - The `play` branch contains a setup for sequential messaging and multiple potential content sources for the sides.
- `phone` - The `phone` branch contains a simple demo of a 3D CSS Nexus 6.

### Content

Content for the side of cubes is handled in the `cube/content` module. Each side is defined with an `html` function which returns compiled html for the side of the cube as well as an `onload` function which is fired after the `html` is inserted. This allows us to add event handlers to dynamic content such as buttons etc.

### Celtra

The Ad is designed to work with Celtra. Unfortunately we have not yet come to an agreement with Celtra as to how we should incorporate assets (see the assets section of this doc), but in this section we will go through the proposed process of incorporation.

Celtra advices us to use their Frame/Div component. This allows us to run some JavaScript in our initial setup and then load an external JS file (our main compiled js) on 'first appear' of the ad.

The HTML of every non-script element in our files `body` is copied into the `innerHTML` property of the `div` and the `div` is given a class of `body` so we dont have to change anything with our CSS.

```javascript
div.className = 'body';
div.innerHTML = '{{ SNIP! HTML GOES HERE }}';
```

The CSS is copied from our compiled file and pasted into the `innerText` of a created `style` tag in the Ad Creator:

```javascript
var style = document.createElement('style');
style.innerText = "{{ SNIP! CSS GOES HERE }}"; // This shit is lovely! </sarcasm>

div.appendChild(style);
```

Thats it for the initial setup. The on `first appear` and `Execute JS` action is created to load our JS and init our cube:

```
loadJS('{{ URL to JS }}', function() {
    c();
    window.InitCube(); 
});
```

The JS already checks to see if it is in Celtra and exposes it's init function on the window object if it is.

### Asset Management

Images and Sounds are preloaded using the `AssetManager`. These assets are cached in memory and should not be accessed in any other way than using the `AssetManager.get` function.

Images should be optimised as much as possible using either [ImageOptim](http://imageoptim.com) for pngs and gifs or [JPEGMini](http://www.jpegmini.com) for jpgs.
