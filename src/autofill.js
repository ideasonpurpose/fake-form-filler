'use strict';

// This script is meant to be pulled into a bookmarklet. Create a bookmark with the following
// code snippet as the address.
//
// javascript:(function(){var s=document.createElement('script');s.type='text/javascript';s.async=true;s.src='https://rawgit.com/ideasonpurpose/qa-form-helper/master/autofill.src.js';document.getElementsByTagName('head')[0].appendChild(s);})()

var $ = require('jquery');

var Chance = require('chance');
var chance = new Chance();

/**
 * All the logic is in here. This attempts
 * to enter proper information for email,
 * urls, names, addresses, etc.
 */
var fillify = function(input) {
  var $input = $(input);
  var type = $input.attr('type');
  var name = $input.attr('name');
  var id = $input.attr('id');

  // email
  var mail_regex = /e[-_.]?mail/i;
  if (mail_regex.test(type) || mail_regex.test(name) || mail_regex.test(id)) {
    return $input.val(chance.email());
  }

  // urls
  var url_regex = /(url|web\s?(site|page)?)/i;
  if (type === 'url' || url_regex.test(name) || url_regex.test(id)) {
    return $input.val(chance.url());
  }

  // phone numbers
  var phone_regex = /((mobile|tele)[- ]?)?phone/i;
  if (phone_regex.test(name) || phone_regex.test(id)) {
    return $input.val(chance.phone());
  }

  // Everything else gets a name for now
  return $input.val(chance.name({middle: chance.bool()}));
};

/**
 * Get all inputs
 *  - skip submit buttons
 *  - skip hidden fields
 */
$('input')
  .not('[type=submit]')
  .not('[type=hidden]')
  .each(function(i, e) {
  fillify(e);
});

/**
 * Choose a random option from selects (skip zeroth option)
 */
$('select').each(function(i, e) {
  // var optCount = e.length;
  var optCount = $(e).find('option').length;
  $(e)
    .find('option')
    .eq(chance.integer({min: 1, max: optCount - 1}))
    .prop('selected', true);
});

/**
 * Fill textareas with random paragraphs
 */
$('textarea').each(function(i, e) {
  $(this).val(chance.paragraph());
});

