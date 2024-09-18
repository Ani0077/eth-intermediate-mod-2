// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CarParkingSystem {
    address payable public owner;
    uint256 public parkingFee = 0.05 ether;  // Fee for renting a parking spot
    uint256 public lateFee = 0.01 ether;     // Additional fee for returning late
    uint256 public freeParkingThreshold = 20; // Points required for a free parking spot

    struct ParkingDetails {
        bool isRented;
        uint256 rentalStartTime;
        uint256 pointsEarned;
    }

    mapping(address => ParkingDetails) public parkingRecords;
    mapping(address => uint256) public loyaltyPoints;  // Track user loyalty points

    event ParkingRented(address indexed user);
    event ParkingReturned(address indexed user, bool lateReturn);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event FreeParkingUsed(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    constructor() payable {
        owner = payable(msg.sender);
    }

    // Function to rent a parking spot
    function rentParkingSpot() public payable {
        require(msg.value == parkingFee, "You must send exactly 0.05 ETH to rent a parking spot");
        require(!parkingRecords[msg.sender].isRented, "Parking spot already rented");

        parkingRecords[msg.sender] = ParkingDetails({
            isRented: true,
            rentalStartTime: block.timestamp,
            pointsEarned: 10  // Earn 10 points for every rental
        });

        loyaltyPoints[msg.sender] += parkingRecords[msg.sender].pointsEarned;
        emit ParkingRented(msg.sender);
    }

    // Function to return the rented parking spot
    function returnParkingSpot(bool isLate) public {
        require(parkingRecords[msg.sender].isRented, "No parking spot to return");

        uint256 refundAmount = parkingFee;
        if (isLate) {
            refundAmount -= lateFee;  // Deduct late fee if returned late
            emit ParkingReturned(msg.sender, true);
        } else {
            emit ParkingReturned(msg.sender, false);
        }

        parkingRecords[msg.sender].isRented = false;
        payable(msg.sender).transfer(refundAmount);
    }

    // Redeem points for a free parking spot
    function useLoyaltyPointsForFreeParking() public {
        require(loyaltyPoints[msg.sender] >= freeParkingThreshold, "Not enough loyalty points for free parking");
        require(!parkingRecords[msg.sender].isRented, "Parking spot already rented");

        parkingRecords[msg.sender] = ParkingDetails({
            isRented: true,
            rentalStartTime: block.timestamp,
            pointsEarned: 0  // No points earned for free rental
        });

        loyaltyPoints[msg.sender] -= freeParkingThreshold;  // Deduct points
        emit FreeParkingUsed(msg.sender);
    }

    // Function for owner to withdraw funds
    function withdrawFunds(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in contract");

        owner.transfer(amount);
        emit FundsWithdrawn(owner, amount);
    }

    // View rental status
    function getRentalStatus(address user) public view returns (bool) {
        return parkingRecords[user].isRented;
    }

    // View loyalty points
    function getLoyaltyPoints(address user) public view returns (uint256) {
        return loyaltyPoints[user];
    }

    // Fallback function to receive ETH
    receive() external payable {}

    fallback() external payable {}
}

