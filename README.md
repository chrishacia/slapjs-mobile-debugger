# slapjs-mobile-debugger
Mobile Browser Debugger, made from a need to debug frontend code a little easier from within a mobile browser or hybrid app, where the logging tools like dev consoles are either non-existent or just hard to get to.

The basis of this little script is a quick dirty fix to a problem with debugging a friend of mine had. Where console.log and alerts were hard to see within the context of the browser of the mobile device they were using. While developing something. Its a dirty not so fancy means of capturing and surpressing the built in behavior of the console.log and alert within browsers. Offering a button that you can toggle open/close an overlay that will display the contents of a console.log or alert.

**Usage:**

Simply add the script to your page as seen in the example index.html and it should just run on your next page load (in the head tag)

```
<script src="slap-mobile-debugger.js" defer></script>
```

Then adding the following just before the ending body tag.

```
document.addEventListener('DOMContentLoaded', () => {
    const debuggerInstance = new MobileDebugger({
        suppressConsole: true,
        suppressAlerts: true,
        position: 'bottom-right',
        margin: 20
    });
});
```

https://github.com/user-attachments/assets/4014634b-fcfb-42e9-91e6-e257cc0a7df9

