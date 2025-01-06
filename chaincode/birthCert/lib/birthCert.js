'use strict';

const { Contract } = require('fabric-contract-api');

class BirthCert extends Contract {
    /**
     * constructor() - Constructor method.
     * @param {Object} None
     * @returns {None}
     * @description - Constructor method to initialize the chaincode. 
     *                It sets the enum values for the status of the certificate.
     */
    constructor() {
        super();
        this.isApprovedEnum = {
            Approved: "Approved",
            Rejected: "Rejected",
            Requested: "Requested",
        };
    }

    /**
     * initLedger() - Initialize Ledger
     * @param {Context} ctx the transaction context object
     * @returns {Promise<void>} - Promise for async transaction
     * @description - This method is used to initialize the ledger.
     *                It is called once when the chaincode is deployed.
     */
    async initLedger(ctx) {
        console.info('================================ *** Ledger initialized *** ================================');
    }

    /**
     * Creates a new Birth Certificate with provided details.
     *
     * @param {Context} ctx - The transaction context object.
     * @param {string} id - Unique identifier for the birth certificate.
     * @param {string} userName - The user's name associated with the birth certificate.
     * @param {string} name - The name of the individual whose birth certificate is being created.
     * @param {string} fatherName - The name of the father.
     * @param {string} motherName - The name of the mother.
     * @param {string} dob - Date of birth in the format 'YYYY-MM-DD'.
     * @param {string} gender - Gender of the individual.
     * @param {string} weight - Birth weight of the individual.
     * @param {string} country - Country where the birth occurred.
     * @param {string} state - State where the birth occurred.
     * @param {string} city - City where the birth occurred.
     * @param {string} hospitalName - Name of the hospital where the birth occurred.
     * @param {string} permanentAddress - Permanent address of the individual.
     * @returns {Promise<string>} - The transaction ID of the creation process.
     * @throws Will throw an error if any required fields are missing or if a birth certificate with the same ID already exists.
     * @description This function checks the input fields for completeness and uniqueness. If valid, it creates and stores a new birth certificate on the ledger.
     */
    async createBirthCert(ctx, id, userName, name, fatherName, motherName, dob, gender, weight, country, state, city, hospitalName, permanentAddress) {
        try {
            // check all fields are present
            if (!id || !userName || !name || !fatherName || !motherName || !dob || !gender || !weight || !country || !state || !city || !hospitalName || !permanentAddress) {
                throw new Error('All fields are required');
            }

            // check if id already exists
            const birthCertAsBytes = await ctx.stub.getState(id);
            if (birthCertAsBytes && birthCertAsBytes.length > 0) {
                throw new Error(`Birth certificate with ID: ${id} already exists`);
            }

            const birthCert = {
                name,
                userName,
                fatherName,
                motherName,
                dob,
                gender,
                weight,
                country,
                state,
                city,
                hospitalName,
                permanentAddress,
                docType: 'birthCert',
            };

            await ctx.stub.putState(id, Buffer.from(JSON.stringify(birthCert)));
            const txId = ctx.stub.getTxID();
            console.info(`Birth Certificate created with Transaction ID: ${txId}`);
            return txId;
        } catch (error) {
            console.error('Error creating birth certificate:', error);
            throw new Error('Failed to create birth certificate');
        }
    }

    /**
     * Updates the details of an existing Birth Certificate with the given ID.
     *
     * Validates that all required fields are provided. If any field is missing,
     * an error is thrown. Checks if the Birth Certificate with the specified ID
     * exists. If it doesn't, an error is thrown. If it exists, updates the
     * Birth Certificate with the new details and saves it back to the ledger.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The unique ID of the Birth Certificate to update.
     * @param {string} name - The updated name of the individual.
     * @param {string} fatherName - The updated name of the father.
     * @param {string} motherName - The updated name of the mother.
     * @param {string} dob - The updated date of birth.
     * @param {string} gender - The updated gender.
     * @param {string} weight - The updated weight.
     * @param {string} country - The updated country of birth.
     * @param {string} state - The updated state of birth.
     * @param {string} city - The updated city of birth.
     * @param {string} hospitalName - The updated hospital name of birth.
     * @param {string} permanentAddress - The updated permanent address.
     * @returns {Promise<string>} - The transaction ID of the update operation.
     * @throws {Error} - If any required field is missing or if the update fails.
     */
    async updateBirthCert(ctx, id, name, fatherName, motherName, dob, gender, weight, country, state, city, hospitalName, permanentAddress) {
        try {
            // check all fields are present
            if (!id || !name || !fatherName || !motherName || !dob || !gender || !weight || !country || !state || !city || !hospitalName || !permanentAddress) {
                throw new Error('All fields are required');
            }
            const birthCertAsBytes = await ctx.stub.getState(id);
            if (!birthCertAsBytes || birthCertAsBytes.length === 0) {
                throw new Error(`Birth certificate with ID: ${id} does not exist`);
            }

            const existingBirthCert = JSON.parse(birthCertAsBytes.toString());
            existingBirthCert.name = name;
            existingBirthCert.fatherName = fatherName;
            existingBirthCert.motherName = motherName;
            existingBirthCert.dob = dob;
            existingBirthCert.gender = gender;
            existingBirthCert.weight = weight;
            existingBirthCert.country = country;
            existingBirthCert.state = state;
            existingBirthCert.city = city;
            existingBirthCert.hospitalName = hospitalName;
            existingBirthCert.permanentAddress = permanentAddress;

            await ctx.stub.putState(id, Buffer.from(JSON.stringify(existingBirthCert)));
            const txId = ctx.stub.getTxID();
            console.info(`Birth Certificate updated with Transaction ID: ${txId}`);
            return txId;
        } catch (error) {
            console.error('Error updating birth certificate:', error);
            throw new Error('Failed to update birth certificate');
        }
    }

    /**
     * Retrieves all Birth Certificates in the system.
     *
     * Executes a query to find all documents of type 'birthCert'. Parses and returns the results
     * as an array of JSON objects.
     *
     * @param {Context} ctx - The transaction context object.
     * @returns {Promise<Object[]>} - A promise that resolves to an array of Birth Certificate objects.
     * @throws {Error} - If an error occurs while fetching the certificates.
     */
    async allList(ctx) {
        try {
            const queryString = {
                selector: { docType: 'birthCert' },
            };
            const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const data = await this.filterQueryData(iterator);
            return JSON.parse(data);
        } catch (error) {
            console.error('Error fetching all certificates:', error);
            throw new Error('Failed to fetch certificates');
        }
    }

    /**
     * Retrieves all Birth Certificates associated with a specific user.
     *
     * Constructs a query to search for Birth Certificates with a matching user name.
     * Executes the query on the ledger and parses the results to return an array
     * of Birth Certificate objects.
     *
     * @param {Context} ctx - The transaction context object.
     * @param {string} userName - The name of the user whose Birth Certificates are to be retrieved.
     * @returns {Promise<Object[]>} - A promise that resolves to an array of Birth Certificate objects.
     * @throws {Error} - If an error occurs while fetching or parsing the certificates.
     */
    async getUserBirthCerts(ctx, userName) {
        try {
            const queryString = {
                selector: { name: userName },
            };
            const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const data = await this.filterQueryData(iterator);
            return JSON.parse(data);
        } catch (error) {
            console.error('Error fetching user certificates:', error);
            throw new Error('Failed to fetch user certificates');
        }
    }

    /**
     * Helper function to filter out unnecessary data from query results.
     *
     * Takes an iterator returned from a query and returns a promise that resolves to
     * a JSON string of the filtered data. The filtered data is an array of objects,
     * each containing a Key and a Record. The Key is the key of the record in the
     * ledger, and the Record is the actual data stored in the ledger, parsed as a
     * JSON object if possible.
     *
     * @param {Iterator} iterator - The iterator returned from a query.
     * @returns {Promise<string>} - A promise that resolves to a JSON string of the filtered data.
     * @throws {Error} - If an error occurs while filtering the data.
     */
    async filterQueryData(iterator) {
        try {
            const allResults = [];
            while (true) {
                const res = await iterator.next();

                if (res.value && res.value.value.toString()) {
                    const Key = res.value.key;
                    let Record;
                    try {
                        Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        Record = res.value.value.toString('utf8');
                    }
                    allResults.push({ Key, Record });
                }
                if (res.done) {
                    await iterator.close();
                    return JSON.stringify(allResults);
                }
            }
        } catch (error) {
            console.error('Error filtering query data:', error);
            throw new Error('Failed to filter query data');
        }
    }

    /**
     * Retrieves all Birth Certificates that match a specific field and value.
     *
     * Constructs a query based on the provided field name and value, executes it on the ledger,
     * and returns the matching Birth Certificates as an array of objects.
     *
     * @param {Context} ctx - The transaction context object.
     * @param {string} fieldName - The name of the field to filter by.
     * @param {string} fieldValue - The value of the field to match.
     * @returns {Promise<Object[]>} - A promise that resolves to an array of Birth Certificate objects.
     * @throws {Error} - If an error occurs while fetching or parsing the certificates.
     */
    async getCertsByField(ctx, fieldName, fieldValue) {
        try {
            const queryString = {
                selector: { [fieldName]: fieldValue },
            };
            const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const data = await this.filterQueryData(iterator);
            return JSON.parse(data);
        } catch (error) {
            console.error('Error fetching certificates by field:', error);
            throw new Error('Failed to fetch certificates by field');
        }
    }

    /**
     * Retrieves a Birth Certificate by its ID.
     *
     * @param {Context} ctx - The transaction context object.
     * @param {string} id - The ID of the Birth Certificate to fetch.
     * @returns {Promise<string>} - A promise that resolves to a string representation
     *          of the Birth Certificate.
     * @throws {Error} - If an error occurs while fetching the certificate.
     */
    async getBirthCert(ctx, id) {
        try {
            const birthCertAsBytes = await ctx.stub.getState(id);
            if (!birthCertAsBytes || birthCertAsBytes.length === 0) {
                throw new Error(`Birth certificate with ID: ${id} does not exist`);
            }
            return birthCertAsBytes.toString();
        } catch (error) {
            console.error('Error fetching birth certificate:', error);
            throw new Error('Failed to fetch birth certificate');
        }
    }

    /**
     * Retrieves the history of a Birth Certificate by its ID.
     *
     * @param {Context} ctx - The transaction context object.
     * @param {string} id - The ID of the Birth Certificate to fetch.
     * @returns {Promise<Object[]>} - A promise that resolves to an array of objects,
     *          where each object represents a transaction on the Birth Certificate.
     *          The object contains the transaction ID, timestamp, whether the transaction
     *          was a deletion, and the data from the transaction.
     * @throws {Error} - If an error occurs while fetching the history.
     */
    async getBirthCertHistory(ctx, id) {
        try {
            console.info(`Fetching history for birth certificate with ID: ${id}`);
            const iterator = await ctx.stub.getHistoryForKey(id);
            const history = [];

            while (true) {
                const res = await iterator.next();

                if (res.value) {
                    const record = {
                        txId: res.value.txId,
                        timestamp: res.value.timestamp,
                        isDelete: res.value.isDelete,
                        data: JSON.parse(res.value.value.toString('utf8')),
                    };
                    history.push(record);
                }

                if (res.done) {
                    await iterator.close();
                    break;
                }
            }

            console.info(`History for ID ${id}: ${JSON.stringify(history)}`);
            return history;
        } catch (error) {
            console.error('Error fetching birth certificate history:', error);
            throw new Error('Failed to fetch birth certificate history');
        }
    }
}

module.exports = BirthCert;
