pragma solidity ^0.5.0;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint256 id;
        string name;
        string breed;
        uint256 age;
        string loc;
        string img;
        uint256 voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store accounts that have registered
    mapping(address => bool) public regList;
    // Store Candidates
    // Fetch Candidate
    mapping(uint256 => Candidate) public candidates;
    // Store Candidates Count
    uint256 public candidatesCount;

    // voted event
    event votedEvent(uint256 indexed _candidateId);

    event registeredEvent(uint256 indexed candidatesCount);

    constructor() public {
        addCandidate(
            "Gina",
            "Scottish Terrier",
            3,
            "Tooleville, West Virginia",
            "images/scottish-terrier.jpeg"
        );
        addCandidate(
            "Collins",
            "French Bulldog",
            2,
            "Freeburn, Idaho",
            "images/french-bulldog.jpeg"
        );
        addCandidate(
            "Melissa",
            "Boxer",
            2,
            "Camas, Pennsylvania",
            "images/boxer.jpeg"
        );
        addCandidate(
            "Gina",
            "Golden Retriever",
            3,
            "Soudan, Louisiana",
            "images/golden-retriever.jpeg"
        );
    }

    function addCandidate(
        string memory _name,
        string memory _breed,
        uint256 _age,
        string memory _loc,
        string memory _img
    ) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            _breed,
            _age,
            _loc,
            _img,
            0
        );
    }

    function vote(uint256 _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    function register(
        string memory _name,
        string memory _breed,
        uint256 _age,
        string memory _loc,
        string memory _img
    ) public {
        addCandidate(_name, _breed, _age, _loc, _img);

        emit registeredEvent(candidatesCount);
    }
}
