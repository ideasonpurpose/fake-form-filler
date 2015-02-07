An autofill bookmarklet for quickly populating web forms with fake data. Useful for testing. 

To install, just copy this url into a bookmark: 

    javascript:(function(){var s=document.createElement('script');s.type='text/javascript';s.async=true;s.src='https://rawgit.com/ideasonpurpose/qa-form-helper/master/autofill.js';document.getElementsByTagName('head')[0].appendChild(s);})()

Lightly tested, seems to work most everywhere.
