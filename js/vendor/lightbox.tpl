<div class="modal-content"
    ng-swipe-left="Lightbox.nextImage()"
    ng-swipe-right="Lightbox.prevImage()">
  
  <!-- navigation -->
  <div class="modal-header">
  <div class="lightbox-nav">
    <!-- close button 
    <button class="close" aria-hidden="true" ng-click="$dismiss()">×</button>-->
    <button type="button" class="close" data-dismiss="modal" aria-label="Close" ng-click="$dismiss()">
          <span aria-hidden="true">&times;</span>
    </button>

    <div class="btn-group btn-group-sm" role="group" ng-if="Lightbox.images.length > 1">
      <a class="btn btn-primary-outline btn-sm" ng-click="Lightbox.prevImage()">
        ‹ Previous
      </a>

      <a class="btn btn-primary-outline btn-sm" ng-click="Lightbox.nextImage()">
        Next ›
      </a>
    </div>
  </div> 
  </div>

  <div class="modal-body lightbox-image-container">
    <!-- caption -->
    <div class="lightbox-image-caption">
      <span>{{Lightbox.imageCaption}}</span>
    </div>

    <!-- image -->
    <img ng-if="!Lightbox.isVideo(Lightbox.image)"
        lightbox-src="{{Lightbox.imageUrl}}">

    <!-- video -->
    <div ng-if="Lightbox.isVideo(Lightbox.image)"
        class="embed-responsive embed-responsive-16by9">
      <!-- video file embedded directly -->
      <video ng-if="!Lightbox.isSharedVideo(Lightbox.image)"
          lightbox-src="{{Lightbox.imageUrl}}"
          controls
          autoplay="true">
      </video>

      <!-- video embedded with an external service using
           `ng-videosharing-embed` -->
      <embed-video ng-if="Lightbox.isSharedVideo(Lightbox.image)"
          lightbox-src="{{Lightbox.imageUrl}}"
          ng-href="{{Lightbox.imageUrl}}"
          iframe-id="lightbox-video"
          class="embed-responsive-item">
        <a ng-href="{{Lightbox.imageUrl}}">Watch video</a>
      </embed-video>
    </div>
  </div>
</div>
