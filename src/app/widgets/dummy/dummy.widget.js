(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetDummy', widgetDummy)
        .controller('WidgetSettingsCtrl-dummy', WidgetSettingsCtrlDummy)
        .config(function (WidgetsProvider) {
            WidgetsProvider.$get().registerType({
                type: 'dummy',
                displayName: 'Dummy',
                icon: 'text-color',
                description: 'A dummy widget - displays the value of an item'
            });
        });

    widgetDummy.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetDummy($rootScope, $modal, OHService) {
        // Usage: <widget-dummy ng-model="widget" />
        //
        // Creates: A dummy widget
        //
        var directive = {
            bindToController: true,
            controller: DummyController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/dummy/dummy.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
        }
    }
    DummyController.$inject = ['$rootScope', '$scope', '$filter', 'OHService'];
    function DummyController ($rootScope, $scope, $filter, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item) {
                vm.value = "N/A";
                return;
            }
            var value = item.transformedState || item.state;

            if (vm.widget.decodePattern) {
              for (var singleDecodePattern of vm.widget.decodePattern.split(',')) {
                  singleDecodePattern = singleDecodePattern.split('=');
                  if (singleDecodePattern[0] == value.toString()) {
                        if (singleDecodePattern.length == 2) {
                            value = singleDecodePattern[1];
                        } else {
                            value = singleDecodePattern[0];
                        }
                        break;
                    }
                }
            }

            if (vm.widget.prettyPrintJson) {
                value = JSON.stringify(JSON.parse(value), null, 2);
            }
            if (vm.widget.format) {
                value = sprintf(vm.widget.format, value);
            }
            if (vm.widget.useserverformat && item.stateDescription && item.stateDescription.pattern) {
                value = sprintf(item.stateDescription.pattern, value);
            }
            vm.value = value;
            vm.state = item.state;
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlDummy.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlDummy($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        // $scope.items = OHService.getItems();

        $scope.form = {
            name             : widget.name,
            sizeX            : widget.sizeX,
            sizeY            : widget.sizeY,
            col              : widget.col,
            row              : widget.row,
            item             : widget.item,
            // background       : widget.background,
            // foreground       : widget.foreground,
            font_size        : widget.font_size,
            nolinebreak      : widget.nolinebreak,
            unit             : widget.unit,
            format           : widget.format,
            decodePattern    : widget.decodePattern,
            useserverformat  : widget.useserverformat,
            prettyPrintJson  : widget.prettyPrintJson,
            backdrop_iconset : widget.backdrop_iconset,
            backdrop_icon    : widget.backdrop_icon,
            backdrop_center  : widget.backdrop_center,
            iconset          : widget.iconset,
            icon             : widget.icon,
            icon_size        : widget.icon_size,
            icon_nolinebreak : widget.icon_nolinebreak,
            icon_replacestext: widget.icon_replacestext
        };

        $scope.$watch('form.item', function (item, oldItem) {
            if (item === oldItem) {
                return;
            }
            OHService.getObject(item).then(function (obj) {
                if (obj && obj.common) {
                    if (obj.common.name) {
                        $scope.form.name = obj.common.name;
                    }
                }
            });
        });

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);

            $modalInstance.close(widget);
        };

    }


})();
