;+function($) {

  'use strict';

  $.fn.expose = function() {
    
    var $modal   = $(this),
        $modalBG = $('<div class="modal_bg">'),
        $body    = $('body'),
        $trigger = $('a[href=' + this.selector + ']');
    
    $modal.prepend($modalBG);
    
    $modal.on('expose:open', function() {
      
      $body.addClass('modal--open');
      $modal.trigger('expose:opened');

      setTimeout(function() {
        $body.css('overflow', 'hidden');
      }, 500);
    });
    
    $modal.on('expose:close', function() {
      
      $body.removeClass('modal--open');
      $modal.trigger('expose:closed');

      setTimeout(function() {
        $body.css('overflow', '');
      }, 500);
    });
    
    $trigger.on('click', function(e) {
      
      e.preventDefault();
      $modal.trigger('expose:open');
    });
    
    $modal.add( $modal.find('.modal_close') ).on('click', function(e) {
      
      e.preventDefault();
      
      // if it isn't the background or close button, bail
      if( e.target !== this )
        return;
      
      $modal.trigger('expose:close');
    });
    
    return;
  };
}(jQuery);