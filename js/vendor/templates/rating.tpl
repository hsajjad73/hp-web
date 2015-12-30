<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">
    <span ng-repeat-start="r in range track by $index" class="sr-only">({{ $index < value ? '*' : ' ' }})</span>
    <i ng-repeat-end ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="fa" ng-class="$index < value && (r.stateOn || 'fa-star') || (r.stateOff || 'fa-star-o')" ng-attr-title="{{r.title}}" aria-valuetext="{{r.title}}"></i>
</span>