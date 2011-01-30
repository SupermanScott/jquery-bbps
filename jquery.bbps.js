/*!
 * jQuery BBPS: Back Button & Push State - $Id:$
 * 
 * Allows for AJAX loading of pages using the recommended Google standard #! or
 * uses pushState emulating actual page loads.
 * 
 * Use in place of loading the whole page by only loading the compents
 * required to render the page. Only works with one controller, useful for
 * opening pages that use the same layout and contents except for the main
 * column. Not useful for maintaining state of multiple objects. For example,
 * loading an overlay over a supplied page. This plugin should not be used to
 * maintain that state.
 * 
 * Copyright (c) 2011 "SupermanScott" Scott Reynolds
 */
(function($,window){
    supports_push_state = history.pushState !== undefined;
    // Does the browser support window.onhashchange? Taken from jQuery BBQ.
    supports_hash_change = 'onhashchange' in window && ( document.documentMode === undefined || doc_mode > 7 );

    state_stack = new Array();
    targets = new Array();

    $.fn.bbps = function(options) {
      if (!supports_hash_change && !supports_push_state) {
	return this;
      }

      var settings = {
	'target': this,
	'url': this.attr('href')
      };

      if (options) {
	$.extend(settings, options);
      }

      targets.push(settings.target);

      this.live('click', function(evt) {
	  if (state_stack[0] != settings.url) {
	    state_stack.push(settings.url);
	    push_state(settings.url);
	    $(settings.target).trigger('bbps_change', settings.url);
	  }
	  return false;
      });

      if (!supports_push_state) {
	// Init those that don't have pushState.
	$(settings.target).trigger('bbps_change', window.location.hash.replace('#!/', ''));
      }
      return this;
   };

   push_state = function (url) {
     if (url.charAt(0) == '/') {
       url = url.substring(1);
     }
     // Browser check to determine how to push state to the url.
     if (supports_push_state) {
       history.pushState({'url': url}, '', url);
     }
     else {
       window.location.hash = '!/' + url;
     }
     return this;
   };

   if (supports_push_state) {
     window.onpopstate = function(event) {
       url = window.location.toString();
       trigger_all_targets(url);
     };
   }

   else if (supports_hash_change) {
     window.onhashchange = function(evt) {
       url = window.location.hash.replace('#!/', '');
       trigger_all_targets(url);
     };
   }

   trigger_all_targets = function (url) {
     if (state_stack.length > 0 && state_stack[0] != url) {
       for (target in targets) {
	 $(targets[target]).trigger('bbps_change', url);
       }
       state_stack.pop();
     }
   };
   
})(jQuery, this);