//tagmng8.js
"use strict";
if (typeof deskAdsNum === 'undefined')
   var deskAdsNum=2;
if (typeof mobileAdsNum === 'undefined')
   var mobileAdsNum=2;
if (typeof rtads === 'undefined')
   var rtads;
if (typeof rtlots === 'undefined')
   var rtlots;
if( document.readyState !== 'loading' ) {
   //setAds();
   //setAnalytics();
   setConsent();
}
else {
   window.addEventListener("DOMContentLoaded",function(){
      //setAds();
      //setAnalytics();
      setConsent();
   });
}
function initConsent()
{
   window.dataLayer = window.dataLayer || [];
   function gtag() { dataLayer.push(arguments); }
   gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_personalization': 'denied',
      'ad_user_data': 'denied',
      'analytics_storage': 'denied',
      'wait_for_update': 1500
   });
   window.addEventListener('adconsentReady', function () {
      adconsent('getConsent', null, function (consent, success) {
         if (success) {
            if (consent.fullConsent) {
               gtag('consent', 'update', {
                  'ad_storage': 'granted',
                  'ad_personalization': 'granted',
                  'ad_user_data': 'granted',
                  'analytics_storage': 'granted'
               });
            }
         }
      });
   });
}
function setConsent()
{
   initConsent();
   var s=document.createElement('script');
   s.async=true;
   s.onload = function () {
      //adconsent('setPublisherCC', 'US');
      //adconsent('enableGoogleAnalytics', true);
      adconsent.gdpr('setLogo', '/lib/favicon/favicon-32x32.png');
      adconsent('setPrivacyPolicy', '/about/privacy.html');
      adconsent('start');
      setAds();
      setAnalytics();
   };
   s.src="//cdn.snigelweb.com/adconsent/adconsent.js";
   document.head.appendChild(s);
}
/*
<script data-cfasync="false" type="text/javascript">
   var rtads=window.innerWidth<800?["adhesive","bottom_01"]:["right_sidebar","bottom_01"];
   window.snigelPubConf = {
      "adengine": {
         "activeAdUnits": rtads
      }
   }
</script>
<script async data-cfasync="false" src="https://dev.cdn.snigelweb.com/adengine/master/rapidtables.com/loader.js" type="text/javascript"></script>
*/
function setAds()
{
   //if( typeof hideAds !== 'undefined' ) return;
   //if( navigator.userAgent.indexOf("Mozilla/5.0")==-1 ) return;
   if( deskAdsNum==0 ) {
      document.getElementById("adngin-right_sidebar-0").style.display="none";
      return;
   }
   if( mobileAdsNum==0 && window.innerWidth<980 )
      return;
   if( rtads==undefined )
      rtads=window.innerWidth<980?["adhesive","bottom_01"]:["right_sidebar","bottom_01"];
   if( rtlots==undefined ) {
      if( window.innerWidth<980 )
         rtlots=[
            {placement: "adngin-adhesive-0", adUnit: "adhesive"},
            {placement: "adngin-bottom_01-0", adUnit: "bottom_01", lazyLoad: true},
         ];
      else
         rtlots=[
            {placement: "adngin-right_sidebar-0", adUnit: "right_sidebar" },
            {placement: "adngin-bottom_01-0", adUnit: "bottom_01", lazyLoad: true},
         ];      
   }
   window.snigelPubConf = {
      "adengine": {
         "activeAdUnits": rtads,
         "activeLots": rtlots
      }
   }
   if(1) {
      //Code for TrafficCop:
      window.pg=window.pg||{};
      pg.atq=pg.atq||[];
      //pg.atq.push(function() { pg.loadJS("https://www.rapidtables.com/lib/admng.js"); });
      pg.atq.push(function() { pg.loadJS("https://cdn.snigelweb.com/adengine/rapidtables.com/loader.js"); });
      var tcs=document.createElement('script');
      tcs.async=true;
      tcs.src="//c.pubguru.net/pg.rapidtables.com.js";
      document.head.appendChild(tcs);
   }
   else {
      var s=document.createElement('script');
      //s.data-cfasync='false'; will not work to exclude from rocket loader
      s.async=true;
      s.src="https://cdn.snigelweb.com/adengine/rapidtables.com/loader.js";
      document.head.appendChild(s);
   }
}

function setAnalytics()
{
   var s=document.createElement('script');
   s.async=true;
   s.src="https://www.googletagmanager.com/gtag/js?id=G-NY85XQ2FKR";
   document.head.appendChild(s);
   window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
   gtag('js', new Date());
   gtag('config', 'G-NY85XQ2FKR');
}

function OnPageSearch()
{
   var csediv=document.getElementsByClassName("gcse-search");
   if( csediv.length>0 ) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://cse.google.com/cse.js?cx=79675d3642b30784a";
      document.head.appendChild(s);
   }
   setTimeout(function() {
      var e=document.querySelector("#header input");
      if( e!=null ) e.focus();
   },1000);
}
function OnPageShare()
{
   if( typeof navigator.canShare == 'function' ) {
      navigator.share({
         title: document.title,
         url: window.location.href
      })
      //.then(() => console.log('Share was successful.'))
      //.catch((error) => console.log('Sharing failed', error));
   }
   else {
      console.log('Your system does not support sharing files.');
   }
}
function OnSubFb()
{
   var m="feedback.r";
   var txt=document.getElementById("fdbkarea").value;
   var url=window.location.href;
   var body="Page URL:\r\n"+url;
   body+="\r\nScreen size:\r\n"+window.screen.width+"x"+window.screen.height;
   body+="\r\nOS:\r\n"+window.navigator.platform;
   body+="\r\nUser agent:\r\n"+window.navigator.userAgent;
   body+="\r\n\r\nMessage:\r\n"+txt;
   body = encodeURIComponent(body);
   m+="apidtables@gmail.com";
   var msg="mailto:"+m+"?subject=Page%20Feedback&body="+body;
   if( txt.length>30 )
   {
      //var form = document.getElementById("fdbkform"); function handleForm(e) { e.preventDefault(); } form.addEventListener('submit', handleForm);
      //window.location.href = msg;
      var mail = document.createElement("a");
      mail.href = msg;
      mail.click();
      document.getElementById("fdbkmsg").textContent="If your mail client is not defined, please copy & send your message to "+m;
   }
}
