
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      var arr = null;
      arr = await window.ethereum.enable(); //arr is the array of accounts, arr[0] the first account
      if(arr!==null){web3 = new Web3(App.web3Provider)} else{console.log("metamask user did not enable the accounts")};
      return App.initContract();
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    }
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      //All this function is doing is re-rendering the landing page if any account has already voted
      //The votedEvent only keeps track of whether some account (does not matter which) has voted
      //Once the votedEvent is true, the landing page is re-rendered
      //This is just to show you how to use an event
      //Note that the votedEvent is viewable without being labled public
      //Data needs to be labled public only if it is going to be updatable
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },




render: function() {
var electionInstance;
var loader = $("#loader");
var content = $("#content");

loader.show();
content.hide();

// Load account data
web3.eth.getCoinbase(function(err, account) {
  if (err === null) {
    App.account = account;
    $("#accountAddress").html("Your Account: " + account);
  }
});

// Load contract data
//the reason why Promise.all is necessary here is explained in ElectionMapping.txt
App.contracts.Election.deployed().then(function(instance) {
  electionInstance = instance;
  return electionInstance.candidatesCount();
}).then(function(candidatesCount) {
  var candArray = [];
  for (var i = 1; i <= candidatesCount; i++) {
    candArray.push(electionInstance.candidates(i));
  }
  Promise.all(candArray).then(function(values) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
    for (var i = 0; i < candidatesCount; i++) {
      var id = values[i][0];
      var name = values[i][1];
      var voteCount = values[i][2];

      // Render candidate Result
      var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
      candidatesResults.append(candidateTemplate);

      // Render candidate ballot option
      var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
      candidatesSelect.append(candidateOption);
    }
  });
  return electionInstance.voters(App.account);
}).then(function(hasVoted) {
  // Do not allow a user to vote
  if(hasVoted) {
    $('form').hide();
  }
  loader.hide();
  content.show();
}).catch(function(error) {
  console.warn(error);
});
  },




  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

//JQuery:

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});

