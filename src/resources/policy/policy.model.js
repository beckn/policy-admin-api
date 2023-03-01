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
		enum: ["active", "inActive","published"],
		default: "active",
	},
    createdBy:{
        
            type: String,
            required: true,
        
    },
    createdAt:{
        
        type: Date,
        required: true,
    
},
modifiedBy:{
        
    type: String
    

},
modifiedAt:{

type: Date


}
})
const Policy = model("policies", policySchema);

module.exports = Policy;