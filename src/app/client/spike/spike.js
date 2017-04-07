angular.module("commitPanel", [])

  .component("commits",{
      template: 'Here are the commits <br>' +
                  '<git-Hub></git-Hub> ' ,


      controller: function($scope, $http){

        var url =  "http://localhost:6565/api/b5b70e9b-262c-4b7b-9398-d90d07e1cb96/commits/tags/versionone/workitem?numbers=S-01001&apiKey=823c4102-6a07-477f-9a00-3e13047c56b5"

        $http.get(url)
          .then(function(response) {
              console.log( response.data.commits);

            this.data = response.data[0];
            $scope.statuscode = response.status;
            $scope.statustext = response.statustext;
          },
          function(error){
            console.log("error")
          });

        console.log($scope.statuscode)
      }
  })


  .component("gitHub",{
    template: "Committer: {{$ctrl.denise}}!",
    require: {
      parent: '^commits'
    },
    controller: function($scope, $http){
      this.$onInit = function() {
        this.data=this.parent.data;
        this.denise = 'denise'
        console.log(this.data)
      };
    }
  });
