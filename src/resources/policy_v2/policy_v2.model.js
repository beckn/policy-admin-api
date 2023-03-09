const { Document, model, Model, Schema } = require("mongoose");

const policySchema=new Schema({
    policyId: {
		type: String,
	},
    status: {
		type: String,
		enum: ["active", "inactive","published"],
		default: "active",
	},
    domain:{
        type: String,
		required: true,
    },
    owner:{
		type: Object, 
		required: true,
	},
    descriptor: {
		type: Object,
		required: true,
	},
    type:{
		type: String,
		required: true,
	},
    coverage:[{
		type: Object,
		required: true,
	}],
    geofences:[{
		type: Object,
		required: true,
	}],
    rules:{
		type:Object
	},
    
        
    
   
    createdBy:{
        
            type: String,
            required: true,
        
    },
    createdAt:{
        
        type: String,
        required: true,
    
	},

modifiedBy:{     
    type: String
	},
		modifiedAt:{
type: String
	}
})
const PolicyV2 = model("policies_v2", policySchema);

module.exports = PolicyV2;