const { Document, model, Model, Schema } = require("mongoose");

const policySchema=new Schema({
    policyId: {
		type: String,
	},
    domain:{
        type: String,
		required: true,
    },
    type: {
		type: String,
		required: true,
	},
    country:{
		type: String,
		required: true,
	},
    city:{
		type: String,
		required: true,
	},
    name:{
		type: String,
		required: true,
	},
    description:{
		type: String,
		required: true,
	},
    owner:{
		type: String, 
		required: true,
	},
	contactEmail:{
		type: String,
		
	},
	policyDocuments:{
		type: String,
		
	},
    startDate:{
		type: Date,
		required: true,
	},
   endDate:{
		type: Date,
		required: true,
	},
    applicableTo:[{
        type: String,
		required: true,
    }],
    polygon:[{
        type: String,
		required: true,
    }],
        
    
    status: {
		type: String,
		enum: ["active", "inactive","published"],
		default: "active",
	},
    createdBy:{
        
            type: String,
            required: true,
        
    },
    createdAt:{
        
        type: String,
        required: true,
    
	},
	rules:{
		type:Object
	},
modifiedBy:{     
    type: String
	},
		modifiedAt:{
type: String
	}
})
const Policy = model("policies", policySchema);

module.exports = Policy;