var app = angular.module('meal-creator-app', []);

app.filter('percentage', [
	'$filter', function($filter) {
		return function(input, decimals){
			return $filter('number')(input * 100, decimals) + '%';
		}
	}
]);

var sources = {
	"openfoodfacts-de": function($scope, $http, product_name)
	{
		var limit = 10;
		var url = `https://openfoodfacts-api.herokuapp.com/products?product_name=${product_name}`;
		$http.get(url).then(function(response){
			var results = [];
			for (var i = 0; i < response.data.length; i++) 
			{
				var item = response.data[i];
				
				var name = "";
				if(item.brands != null){
					name += item.brands;
					name += " - ";
				}
				name += item.product_name;

				results.push({
					name: name,
					calories100g: "" + item.nutriments.energy_100g * 0.238845897,
					proteins100g: item.nutriments.proteins_100g,
					carbs100g: item.nutriments.carbohydrates_100g,
					fats100g: item.nutriments.fat_100g
				});
			}
			console.log(results);
			$scope.searchResults = results;
		});
	}
};

app.controller('ctrl1', function($scope, $http)
{
	$scope.selectedDataSource = null;
	$scope.dataSources = sources;
	$scope.totalCalories = 100;
	$scope.totalProteins = 101;
	$scope.totalCarbs = 102;
	$scope.totalFats = 103;

	$scope.items = [];

	$scope.calcItem = function(item){
		var factor = item.amount / 100.0;
		item.calories = item.calories100g * factor;
		item.proteins = item.proteins100g * factor;
		item.carbs = item.carbs100g * factor;
		item.fats = item.fats100g * factor;
	}

	$scope.calcTotal = function() {
		$scope.totalCalories = 0;
		$scope.totalProteins = 0;
		$scope.totalCarbs = 0;
		$scope.totalFats = 0;
		for(var index = 0; index < $scope.items.length; ++index){
			var item = $scope.items[index];
			$scope.totalCalories += item.calories;
			$scope.totalProteins += item.proteins;
			$scope.totalCarbs += item.carbs;
			$scope.totalFats += item.fats;
		}
		$scope.totalProteinsPercent = ($scope.totalProteins * 4) / $scope.totalCalories;
		$scope.totalCarbsPercent = ($scope.totalCarbs * 4) / $scope.totalCalories;
		$scope.totalFatsPercent = ($scope.totalFats * 9) / $scope.totalCalories;
	};

	$scope.remove = function(item){
		var index = $scope.items.indexOf(item);
		$scope.items.splice(index, 1);
		$scope.calcTotal();
	}

	$scope.add = function(item){
		item.amount = 100;
		$scope.calcItem(item);
		$scope.items.push(item);
		$scope.calcTotal();
	}

	$scope.search = function(itemName){
		$scope.selectedDataSource($scope, $http, itemName);
	}
});