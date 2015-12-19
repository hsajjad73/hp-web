<ul class="pagination">
  <li ng-if="::boundaryLinks" ng-class="{disabled: noPrevious()||ngDisabled}" class="page-item"><a class="page-link" href ng-click="selectPage(1, $event)">{{::getText('first')}}</a></li>
  <li ng-if="::directionLinks" ng-class="{disabled: noPrevious()||ngDisabled}" class="page-item"><a class="page-link" href ng-click="selectPage(page - 1, $event)">{{::getText('previous')}}</a></li>
  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active,disabled: ngDisabled&&!page.active}" class="page-item"><a class="page-link" href ng-click="selectPage(page.number, $event)">{{page.text}}</a></li>
  <li ng-if="::directionLinks" ng-class="{disabled: noNext()||ngDisabled}" class="page-item"><a class="page-link" href ng-click="selectPage(page + 1, $event)">{{::getText('next')}}</a></li>
  <li ng-if="::boundaryLinks" ng-class="{disabled: noNext()||ngDisabled}" class="page-item"><a href class="page-link" ng-click="selectPage(totalPages, $event)">{{::getText('last')}}</a></li>
</ul>