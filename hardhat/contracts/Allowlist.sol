//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Allowlist {
    // max number of allowlisted addresses allowed
    uint8 public maxAllowlistedAddresses;

    // creates a mapping of allowlistedAddresses
    // if an address is allowlisted, we would set it to true, it is false by default for all other addresses
    mapping(address => bool) public allowlistedAddresses;

    // numAddressesallowlisted would be used to keep track of how many addresses have been allowlisted
    // NOTE: Don't change this variable name, as it will be part of verification
    uint8 public numAddressesAllowlisted;

    // user will input the maximum number of addresses to be allowlisted at time of deployment
    constructor(uint8 _maxAllowlistedAddresses) {
        maxAllowlistedAddresses = _maxAllowlistedAddresses;
    }

    /**
        addAddressToAllowlist - This function adds the address of the sender to the allowlist
     */
    function addAddressToAllowlist() public {
        // this require checks if the user has already been allowlisted
        require(
            !allowlistedAddresses[msg.sender],
            "Wallet address has already been allowlisted"
        );
        // checking if the numAddressesAllowlisted < maxAllowlistedAddresses, throws an error if not
        require(
            numAddressesAllowlisted < maxAllowlistedAddresses,
            "More wallet addresses cannot be added, maximum number allowed reached"
        );
        // add the address which called the function to the allowlisted address array
        allowlistedAddresses[msg.sender] = true;
        // increments the number of allowlisted addresses by 1
        numAddressesAllowlisted += 1;
    }
}

// Allowlist Contract Address: 0x3414608de0EF06aB26e0E4E3b347C9BF5B380B41
