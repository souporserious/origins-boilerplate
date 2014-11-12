$.fn.expose = function () {

    'use strict';
  
    var $modal   = $(this),
        $doc     = $(document),
        $body    = $('body'),
        $trigger = $('a[href=#' + $(this).attr('id') + ']'),

        _scrollTop = 0;
  
    // add close button to modal
    $modal.append('<i class="modal__close" />');

    // open modal functionality
    $modal.on('expose:open', function () {

        // open the modal
        $modal.addClass('modal--open');

        // grab current scroll position
        _scrollTop = $(window).scrollTop();

        // set the body to fixed and position it where scrollbar was
        $body.css('top', -_scrollTop + 'px').addClass('fixed');

        // trigger "opened" callback
        $modal.trigger('expose:opened');
    });

    // close modal functionality
    $modal.on('expose:close', function () {

        // remove fixed position and set back to normal
        $body.removeClass('fixed').css('top', '');

        // position the page back to where it was
        window.scroll(0, _scrollTop);

        // close the modal
        $modal.removeClass('modal--open');

        // trigger "closed" callback
        $modal.trigger('expose:closed');
    });

    // launch modal on click
    $trigger.on('click', function (e) {

        e.preventDefault();
        $modal.trigger('expose:open');
    });

    // close modal with close button or by clicking bg
    $modal.add( $modal.find('.modal__close') ).on('click', function (e) {

        e.preventDefault();

        // if it isn't the background or close button, bail
        if(e.target !== this) {
            return;
        }

        $modal.trigger('expose:close');
    });

    // close modal with ESC key
    $doc.on('keydown keyup', function (e) {

        if(e.which === 27) {
            e.preventDefault();
            $modal.trigger('expose:close');
        }
    });

    return this;
};