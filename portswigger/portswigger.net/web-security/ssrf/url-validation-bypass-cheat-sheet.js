function sendHashToIframe() {
    var iframe = document.querySelector('.cheatsheet-content-iframe');
    var currentUrl = iframe.src.split('#')[0];;
    iframe.src = currentUrl + window.location.hash;
}
window.addEventListener('load', function() {
    window.addEventListener('hashchange', sendHashToIframe);
    sendHashToIframe();
});