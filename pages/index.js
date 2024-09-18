import { useState, useEffect } from "react";
import { ethers } from "ethers";
import CarParkingSystemAbi from "../artifacts/contracts/CarParkingSystem.sol/CarParkingSystem.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [CarParkingSystem, setCarParkingSystem] = useState(undefined);
  const [rentalStatus, setRentalStatus] = useState(undefined);
  const [loyaltyPoints, setLoyaltyPoints] = useState(ethers.BigNumber.from(0));  // Initializing with BigNumber
  const [message, setMessage] = useState("");

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Update this with your contract address
  const CarParkingSystemABI = CarParkingSystemAbi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(undefined);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getCarParkingSystemContract();
    } catch (error) {
      setMessage("Error connecting account: " + (error.message || error));
    }
  };

  const getCarParkingSystemContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const CarParkingSystemContract = new ethers.Contract(contractAddress, CarParkingSystemABI, signer);
    setCarParkingSystem(CarParkingSystemContract);
  };

  const getRentalStatus = async () => {
    try {
      if (CarParkingSystem && account) {
        const status = await CarParkingSystem.getRentalStatus(account);
        setRentalStatus(status);
      }
    } catch (error) {
      setMessage("Error fetching rental status: " + (error.message || error));
    }
  };

  const getLoyaltyPoints = async () => {
    try {
      if (CarParkingSystem && account) {
        const points = await CarParkingSystem.getLoyaltyPoints(account);
        setLoyaltyPoints(points);  // Set BigNumber directly
      }
    } catch (error) {
      setMessage("Error fetching loyalty points: " + (error.message || error));
    }
  };

  const rentParkingSpot = async () => {
    setMessage("");
    if (CarParkingSystem) {
      try {
        let tx = await CarParkingSystem.rentParkingSpot({ value: ethers.utils.parseEther("0.05") });
        await tx.wait();
        getRentalStatus();
        getLoyaltyPoints();
        setMessage("Parking spot rented successfully!");
      } catch (error) {
        setMessage("Unable to rent parking spot: " + (error.message || error));
      }
    }
  };

  const returnParkingSpot = async (isLate) => {
    setMessage("");
  
    // Check if the user has rented a parking spot
    if (!rentalStatus) {
      setMessage("You do not have a parking spot to return.");
      return;
    }
  
    if (CarParkingSystem) {
      try {
        let tx = await CarParkingSystem.returnParkingSpot(isLate);
        await tx.wait();
        getRentalStatus();
        setMessage(isLate ? "Parking spot returned late with a fee." : "Parking spot returned successfully!");
      } catch (error) {
        setMessage("Unable to return parking spot: " + (error.message || error));
      }
    }
  };

  const useLoyaltyPointsForFreeParking = async () => {
    setMessage("");
  
    // Check if the user has enough loyalty points before attempting to use them
    if (loyaltyPoints.lt(ethers.BigNumber.from(20))) {  // Check if loyalty points are less than 50
      setMessage("You do not have enough loyalty points for free parking.");
      return;
    }
  
    if (CarParkingSystem) {
      try {
        let tx = await CarParkingSystem.useLoyaltyPointsForFreeParking();
        await tx.wait();
        getRentalStatus();
        getLoyaltyPoints(); // Update loyalty points after redeeming
        setMessage("Free parking spot redeemed using loyalty points!");
      } catch (error) {
        setMessage("Unable to use loyalty points: " + (error.message || error));
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this parking system.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>Connect MetaMask Wallet</button>
      );
    }

    if (rentalStatus === undefined) {
      getRentalStatus();
    }

    if (loyaltyPoints === 0) {
      getLoyaltyPoints();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p className="rental-status">Rental Status: {rentalStatus ? "Rented" : "Not Rented"}</p>
        <p className="loyalty-points">Loyalty Points: {loyaltyPoints.toString()}</p>  {/* Convert BigNumber to string */}
        <div className="button-container">
          <button onClick={rentParkingSpot}>Rent Parking Spot (1 ETH)</button>
          <button onClick={() => returnParkingSpot(false)}>Return Parking Spot (On Time)</button>
          <button onClick={() => returnParkingSpot(true)}>Return Parking Spot (Late)</button>
          <button onClick={useLoyaltyPointsForFreeParking}>Use Loyalty Points for Free Parking(eligible when have 20 points)</button>
        </div>
        {message && <p><strong>{message}</strong></p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to Car Parking System</h1>
      </header>
      {initUser()}
      <style jsx>{`
  .container {
    text-align: center;
    background-color: white;
    background-size: cover;
    color: olive green;
    font-family: "Times New Roman", serif;
    border: 10px solid black;
    border-radius: 20px;
    background-image: url("https://i.pinimg.com/originals/d6/f2/2c/d6f22ca8a6f0b5da1abb3dea5ed9d974.jpg");
    height: 850px;
    width: 1500px;
    opacity: 0.9;
    font-weight: 1000;
    padding: 20px;
  }

  header {
    padding: 10px;
  }

  h1 {
    font-family: "Arial", serif;
    font-size: 60px;
    margin-bottom: 20px;
  }

  p {
    font-size: 40px; /* Default font size for paragraph text */
  }

  .account-info {
    font-size: 50px; /* Increased font size for account info */
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
  }

  .rental-status, .loyalty-points {
    font-size: 60px; /* Increased font size for rental status and loyalty points */
    font-weight: bold;
    color: white;
  }

  .button-container {
    margin-top: 50px;
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 20px 30px;
    font-size: 24px;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  button:hover {
    background-color: #388e3c;
  }

  .message {
    margin-top: 20px;
    padding: 10px 20px;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    font-weight: bold;
    max-width: 400px;
    text-align: center;
  }
`}</style>

    </main>
  );
}
