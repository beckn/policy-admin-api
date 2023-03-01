const express = require("express");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const Policy = require("./policy.model");
const logger = require("../../libraries/logger");
const { v4: uuidv4 } = require('uuid');
const userResponse = ({
	policyId,
         status,
         domain,
         type,
        country,
         city,
         name,
         description,
         owner,
         startDate,
         endDate,
         applicableTo,
        polygon
}) => ({
	policyId,
         status,
         domain,
         type,
        country,
         city,
         name,
         description,
         owner,
         startDate,
         endDate,
         applicableTo,
        polygon
});

function definePolicyRoutes(expressApp)
{
    const policyRouter = express.Router();
    policyRouter.post(
		"/",
		async (request, response) => {
			try {
				
                const {status,domain,type,country,city,name,description,owner,startDate,endDate,applicableTo,polygon,createdBy}=request.body

				const policyId = uuidv4();
                


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
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    applicableTo,
                    polygon,
                    createdBy,
                    createdAt:new Date()
				});
				response.status(httpStatus.OK).send([result].map(userResponse)[0]);
				logger.fatal(`request completed ${request.headers["x-request-id"]}`);
				return null;
			} catch (error) {
				logger.error(error);
				response
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.send(httpStatus.INTERNAL_SERVER_ERROR);
				return undefined;
			}
		},
	);

    policyRouter.get("/", async (request, response) => {
        try{
            if (Object.keys(request.query).length === 0) {
                const result = await Policy.find({});
                response.status(httpStatus.OK).send(result.map(userResponse));
                logger.fatal(`request completed ${request.headers["x-request-id"]}`);
                return undefined;
            }
            response.status(httpStatus.OK).send([]);
                logger.fatal(`request completed ${request.headers["x-request-id"]}`);
                return undefined;
        }catch (error) {
			logger.error(error);
			response
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send(httpStatus.INTERNAL_SERVER_ERROR);
			return undefined;
		}
       
      
    })
    policyRouter.get("/:policyId", async (request, response) => {

        try {
			const { policyId } = request.params;
			const result = await Policy.find({ policyId: policyId });
			response.status(httpStatus.OK).send(result.map(userResponse));
			logger.fatal(`request completed ${request.headers["x-request-id"]}`);
			return undefined;
		} catch (error) {
			logger.error(error);
			response
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send(httpStatus.INTERNAL_SERVER_ERROR);
			return undefined;
		}

    })
    policyRouter.get("/:domain/:type/:country/:city/:status", async (request, response) => {
       
        try {
            const {domain,type,country,city,status}=request.params
			const result = await Policy.findOne({$and:[{ domain: domain },{type:type},{country:country},{city:city},{status:status}]});
			response.status(httpStatus.OK).send(result);
			logger.fatal(`request completed ${request.headers["x-request-id"]}`);
			return undefined;
		} catch (error) {
			logger.error(error);
			response
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send(httpStatus.INTERNAL_SERVER_ERROR);
			return undefined;
		}
    })
    policyRouter.patch("/",async(request,response)=>{
       
        try {
            const {policyId,status,modifiedBy}=request.body
			const result = await Policy.findOneAndUpdate({policyId:policyId},{ $set: { status: status,modifiedBy: modifiedBy,modifiedAt:new Date()}});
			response.status(httpStatus.OK).send(result);
			logger.fatal(`request completed ${request.headers["x-request-id"]}`);
			return undefined;
		} catch (error) {
			logger.error(error);
			response
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send(httpStatus.INTERNAL_SERVER_ERROR);
			return undefined;
		}
    })
    expressApp.use("/api/policy/v1", policyRouter);

}
module.exports = definePolicyRoutes;