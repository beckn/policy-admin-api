const express = require("express");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const Policy = require("./policy_v2.model");
const logger = require("../../libraries/logger");
const { v4: uuidv4 } = require("uuid");
const format = require("date-fns/format");
const policyResponse = ({
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
}) => ({
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
});

function definePolicyV2Routes(expressApp) {
  const policyV2Router = express.Router();

  policyV2Router.post(
    "/",
    (request, response, next) => {
      const { coverage } = request.body.policy;
      // coverage validation
      // coverage temporal validation
      // coverage temporal range validation
      if (
        coverage.length === 1 &&
        coverage[0].temporal &&
        coverage[0].temporal.length === 1 &&
        coverage[0].temporal[0].range &&
        new Date(coverage[0].temporal[0].range.start).getTime() > 0 &&
        new Date(coverage[0].temporal[0].range.end).getTime() > 0
      ) {
        next();
      } else {
        response.status(httpStatus.BAD_REQUEST).send({
          message: "Invalid coverage parameters",
        });
      }
    },
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
          createdBy,
        } = request.body.policy;

        const policyId = uuidv4();

        const value = createdBy ? createdBy : "system";

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
          createdBy: value,
          createdAt: new Date().toISOString(),
        });

        response.status(httpStatus.OK).send({
          policy: {
            id: result.policyId,
            status: result.status,
          },
        });
        logger.fatal(`request completed ${request.headers["x-request-id"]}`);
        return null;
      } catch (error) {
        logger.error(error);
        response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          error: {
            code: httpStatus.INTERNAL_SERVER_ERROR,
            message: "Unexpected error",
            data: error.message,
            type: "System Error",
            path: request.path,
          },
        });
        return undefined;
      }
    }
  );

  policyV2Router.get("/", async (request, response) => {
    try {
      const result = await Policy.find({});
      response.status(httpStatus.OK).send({
        policies: result.map((data) => ({
          id: data.policyId,
          status: data.status,
          name: data.descriptor.name,
          description: data.descriptor.short_desc,
          startDate: data.coverage[0].temporal[0].range.start,
          endDate: data.coverage[0].temporal[0].range.end,
        })),
      });
    } catch (error) {
      logger.error(error);
      response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        error: {
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: "Unexpected error",
          data: error.message,
          type: "System Error",
          path: request.path,
        },
      });
      return undefined;
    }
  });

  policyV2Router.get("/:policyId", async (request, response) => {
    try {
      const { policyId } = request.params;
      console.log(policyId)
      const result = await Policy.findOne({ policyId: policyId });
      console.log(result)
      if (!result) {
        response.status(httpStatus.BAD_REQUEST).send({
          error: {
            code: httpStatus.BAD_REQUEST,
            message: "Invalid_policyId",
            type: "Bad_request",
            path: request.path,
          },
        });
      } else {
        response.status(httpStatus.OK).send({policy:{
          "id": result.policyId,
          "status": result.status,
          "domain": result.domain,
          "owner":result.owner,
          "descriptor":result.descriptor,
          "type":result.type,
          "coverage":result.coverage,
          "geofences":result.geofences,
          "rules":result.rules
        }});
      }

      logger.fatal(`request completed ${request.headers["x-request-id"]}`);
      return undefined;
    } catch (error) {
      logger.error(error);
      response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        error: {
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: "Unexpected error",
          data: error.message,
          type: "System Error",
          path: request.path,
        },
      });
      return undefined;
    }
  });

  expressApp.use("/v2/policy", policyV2Router);
}
module.exports = definePolicyV2Routes;
