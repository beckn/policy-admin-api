const express = require("express");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const Policy = require("./policy.model");
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

const userResponse=({id,status,name,description,startDate,endDate})=>({id,status,name,description,startDate,endDate})

function definePolicyRoutes(expressApp)
{
    const policyRouter = express.Router();
    policyRouter.post(
		"/",
		async (request, response) => {
			try {
				
                const {status,domain,type,country,city,name,description,owner,rules,contactEmail,policyDocuments,startDate,endDate,applicableTo,polygon,createdBy}=request.body.policy
                if (typeof domain !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_domain",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
                if (typeof name !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_name",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
                if (typeof status !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_status",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
                if (typeof type !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_type",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
                if (typeof country !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_country",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
                if (typeof city !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_city",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
                if (typeof description !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_description",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
                if (typeof owner !== "string") {
                    response
                        .status(httpStatus.BAD_REQUEST)
                        .send({"error": {
                            "code": httpStatus.BAD_REQUEST,
                            "message": "Invalid_owner",
                            "path": request.path
                          }});
                    logger.fatal(`validation error ${request.headers["x-request-id"]}`);
                    return null;
                }
               
				const policyId = uuidv4();
                
                 const value = createdBy ? createdBy : "system"

				const result = await Policy.create({
					policyId,
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
                    startDate:format(new Date(startDate), 'yyyy-MM-dd'),
                    endDate: format(new Date(endDate), 'yyyy-MM-dd'),
                    applicableTo,
                    polygon,
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

    policyRouter.get("/", async (request, response) => {
        try{
            const {domain,type,country,city,status}=request.query
            
            let key=Object.values(request.query)
            let filter="0"
            if(key.includes("all")||key.includes("All")|| key.includes("ALL"))
            {
                filter="1"
            }
           if((Object.keys(request.query).length === 0) || (filter==="1" ))
            {
              
                const result = await Policy.find();
                const policyList=result.map(userResponse)
                response.status(httpStatus.OK).send({policies:policyList});
                logger.fatal(`request completed ${request.headers["x-request-id"]}`);
                return undefined;
            }
            else
            {
                const result = await Policy.find(Object.keys(request.query).length === 0 ? {}: request.query);
                const policyList=result.map(userResponse)
                response.status(httpStatus.OK).send({policies:policyList});
                logger.fatal(`request completed ${request.headers["x-request-id"]}`);
                return undefined;
            }
           
              
        }catch (error) {
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
       
      
    })
    policyRouter.get("/:policyId", async (request, response) => {

        try {
			const { policyId } = request.params;
			const result = await Policy.findOne({ policyId: policyId });
            if (!result) {
				response
					.status(httpStatus.BAD_REQUEST)
					.send({"error": {
                        "code": httpStatus.BAD_REQUEST,
                        "message": "Invalid_policyId",
                        "type": "Bad_request",
                        "path": request.path
                      }});
            
                    }
            else{
                response.status(httpStatus.OK).send({policy:{
                    "id": result.policyId,
                    "status": result.status,
                    "domain": result.domain,
                    "type": result.type,
                    "country": result.country,
                    "city": result.city,
                    "name": result.name,
                    "description": result.description,
                    "owner": result.owner,
                    "contactEmail": result.contactEmail,
                    "policyDocuments": result.policyDocuments,
                    "startDate": result.startDate,
                    "endDate": result.endDate,
                    "applicableTo": result.applicableTo,
                    "polygon": result.polygon,
                    "rules": result.rules,
                    "createdBy": result.createdBy,
                    "createdAt": result.createdAt,
                    "latModifiedBy": result.modifiedBy,
                    "lastModifiedAt": result.modifiedAt
                  }});
            }
			
			logger.fatal(`request completed ${request.headers["x-request-id"]}`);
			return undefined;
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

    })
   
    policyRouter.patch("/",async(request,response)=>{
       
        try {
            const {id,status,modifiedBy}=request.body.policy
            
                if(!Boolean(id))
                {
                    response
					.status(httpStatus.BAD_REQUEST)
					.send({"error": {
                        "code": httpStatus.BAD_REQUEST,
                        "message": "Invalid_policyId",
                        "type": "Bad_request",
                        "path": request.path
                      }});
				logger.fatal(`validation error ${request.headers["x-request-id"]}`);
				return null;
                }

                if(!Boolean(status))
                {
                    response
					.status(httpStatus.BAD_REQUEST)
					.send({"error": {
                        "code": httpStatus.BAD_REQUEST,
                        "message": "Invalid_status",
                        "type": "Bad_request",
                        "path": request.path
                      }});
				logger.fatal(`validation error ${request.headers["x-request-id"]}`);
				return null;
                }
                if(status!="active"||status!="inactive"||status!="published")
                {
                    response
					.status(httpStatus.BAD_REQUEST)
					.send({"error": {
                        "code": httpStatus.BAD_REQUEST,
                        "message": "Invalid_status",
                        "type": "Bad_request",
                        "path": request.path
                      }});
				logger.fatal(`validation error ${request.headers["x-request-id"]}`);
				return null;
                }



            const value = modifiedBy ? modifiedBy : "system"
			const result = await Policy.findOneAndUpdate({policyId:id},{ $set: { status: status,modifiedBy: value,modifiedAt:new Date().toISOString()
        }},{
                new: true
              });

              if (!result) {
				response
					.status(httpStatus.BAD_REQUEST)
					.send({"error": {
                        "code": httpStatus.BAD_REQUEST,
                        "message": "Invalid_policyId",
                        "data":"Policy does not exists",
                        "type": "Bad_request",
                        "path": request.path
                      }});
				logger.fatal(`validation error ${request.headers["x-request-id"]}`);
				return null;
			}
            else{
                response.status(httpStatus.OK).send({
                    "policy": {
                      "id": result.policyId,
                      "status": result.status
                    }
                  });
            }
		
			logger.fatal(`request completed ${request.headers["x-request-id"]}`);
			return undefined;
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
    })
    expressApp.use("/v1/policy", policyRouter);

}
module.exports = definePolicyRoutes;