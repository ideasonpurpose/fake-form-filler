// jshint node: true

'use strict';

// This script is meant to be pulled into a bookmarklet. Create a bookmark with the following
// code snippet as the address.
//
// javascript:(function(){var s=document.createElement('script');s.type='text/javascript';s.async=true;s.src='https://rawgit.com/ideasonpurpose/qa-form-helper/master/autofill.src.js';document.getElementsByTagName('head')[0].appendChild(s);})()

var $ = require('jquery');

var Chance = require('chance');
var chance = new Chance();

var confirmables = {
  email: chance.email(),
  password: chance.string({length: chance.integer({min: 6, max: 12}) })

};


var fakeCompanyGenerator = function() {
  var name;
  var i = 0;
  do {
    i++;
    if (i > 100) {
      break;
    }
    var one = chance.weighted([chance.city(), chance.state({full: true }), ''], [3, 3, 1]);
    var two = chance.weighted([chance.last(), ''], [3, 1]);
    var three = chance.weighted([chance.capitalize(chance.word({syllables: 2})), ''], [2, 2]);
    name = chance.shuffle([one, two, three]).join(' ');
    console.log(i, name);
  } while (name.trim() === '');

  var entity = chance.weighted(['Corporation', 'Corp.', 'Inc.', 'Incorporated', 'LLC', 'Ltd.', 'AG', 'GmbH', 'Company', 'Ventures', 'Investments', ''], [7, 7, 6, 6, 6, 4, 3, 3, 4, 3, 2, 4]);
  name = name + ' ' + entity;
  return name.replace(/\s+/g, ' ').trim();
};
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
  var mail_regex = /(e[-_.]?)?mail/i;
  if (mail_regex.test(type) || mail_regex.test(name) || mail_regex.test(id)) {
    return $input.val(confirmables.email);
  }

  // passwords
  if (type === 'password') {
    return $input.val(confirmables.password);
  }

  // urls
  var url_regex = /(url|web\s?(site|page)?)/i;
  if (type === 'url' || url_regex.test(name) || url_regex.test(id)) {
    return $input.val(chance.url());
  }

  // phone numbers
  var phone_regex = /((mobile|tele)[- ]?)?phone/i;
  if (phone_regex.test(name) || phone_regex.test(id)) {
    var phone = chance.phone();
    // TODO: phone numbers are failing against Google's libphonenumber (via https://github.com/Propaganistas/laravel-phone)
    // check them here first?
    return $input.val(phone);
  }

  // Company names
  var co_regex = /(org|organizaton|company|business)(name)?/i;
  if (co_regex.test(name) || co_regex.test(id)) {
    return $input.val(fakeCompanyGenerator());
  }

  // first names
  var fname_regex = /(first|given)[-_. ]?name/i;
  if (fname_regex.test(name) || fname_regex.test(id)) {
    return $input.val(chance.first());
  }

  // Last names, sometimes hyphated
  var lastNameRegex = /(last|family|sur)[-_. ]?name/i;
  var hyphenated = '';
  if (chance.bool({likelihood: 7})) {
    hyphenated = '-' + chance.last();
  }
  if (lastNameRegex.test(name) || lastNameRegex.test(id)) {
    return $input.val(chance.last() + hyphenated);
  }

  // full names
  var name_regex = /(((full)?\s*name)|contact)$/i;
  if (name_regex.test(name) || name_regex.test(id)) {
    return $input.val(chance.name({middle: chance.bool()}));
  }

  // Addresses names
  var address_regex = /(street|post|postal|mailing)?\s*(address)/i;
  if (address_regex.test(name) || address_regex.test(id)) {
    return $input.val(chance.address({short_suffix: chance.bool()}));
  }

  // Throw random strings at whatever's left
  return $input.val(chance.word({syllables: 2}));
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

