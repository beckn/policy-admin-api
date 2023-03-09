const express = require("express");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const Policy = require("./policy_v2.model");
const logger = require("../../libraries/logger");
const { v4: uuidv4 } = require('uuid');
const format=require("date-fns/format");
const policyResponse = ({
	id,
         status,
        domain,
        type,
       country,
        city,
         name,
         description,
         owner,
        rules,
         contactEmail,
        policyDocuments,
         startDate,
         endDate,
         applicableTo,
       polygon
}) => ({
	id,
         status,
        domain,
         type,
        country,
         city,
         name,
         description,
         owner,
         rules,
         contactEmail,
         policyDocuments,
         startDate,
         endDate,
         applicableTo,
        polygon
});


function definePolicyV2Routes(expressApp)
{
    const policyV2Router = express.Router();

    policyV2Router.post(
		"/",
		async (request, response) => {
			try {
      
                const {
                    status,
                    domain,
                    descriptor,
                    owner,
                    media,
                    type,
                    coverage,
                    geofences,
                    rules,
                    createdBy}=request.body.policy
          
               
				const policyId = uuidv4();
                
                 const value = createdBy ? createdBy : "system"

				const result = await Policy.create({
					policyId,
                    status,
                    domain,
                    descriptor,
                    owner,
                    media,
                    type,
                    coverage,
                    geofences,
                    rules,
                   
                    createdBy:value,
                    createdAt:new Date().toISOString()
                
				});
               
				response.status(httpStatus.OK).send({
                    "policy": {
                      "id": result.policyId,
                      "status": result.status
                    }
                  });
				logger.fatal(`request completed ${request.headers["x-request-id"]}`);
				return null;
			} catch (error) {
            
				logger.error(error);
				response
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.send({"error": {
                        "code": httpStatus.INTERNAL_SERVER_ERROR,
                        "message": "Unexpected error",
                        "data": error.message,
                        "type": "System Error",
                        "path": request.path
                      }});
				return undefined;
			}
		},
	);
  
    expressApp.use("/v2/policy", policyV2Router);

}
module.exports = definePolicyV2Routes;