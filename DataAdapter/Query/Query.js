const dronesModel=require("../DataAdapter/Models/drones");
const mongoose = require('mongoose');
const moment =require('moment')


class CollectionQuery {

    async searchCollectionByCustomerCode({ searchText, limit = 25, paymentId = false }) {
        let queryPayload = {};
        if (paymentId == "true") {
            queryPayload = { "customerCode": { $regex: '.*' + searchText + '.*' }, isDisputed: false, type: { $eq: 'online' } };
        } else {
            queryPayload = { "customerCode": { $regex: '.*' + searchText + '.*' }, isDisputed: false };
        }
        return CollectionModel.find({ ...queryPayload,isInvoiceMapped: true, isCollectionMade: true }).select('_id').limit(limit);
    };

    async rejectCollection(ids) {
        return CollectionModel.updateMany(
            { _id: {$in:ids} },
            { $set: { overAllStatus: 'rejected' } },
            { new: true }
        );
    };

    async searchInvoice({ searchText, limit = 25 }) {
        let queryPayload = {};
        queryPayload = { "invoiceId": { $regex: searchText } };
        return InvoicesTally.find({ ...queryPayload }).limit(limit).lean();
    };

    async searchSubmissionByCustomer(params) {
        let { searchText, skipRec, limit = 25 } = params;
        let queryPayload = {};
        queryPayload = {
            $or: [
                { "customerName": searchText },
                { "customerCode": searchText }
            ]
        }
        let records = await InvoicesTally.find({ ...queryPayload }).skip(skipRec).limit(limit).lean();
        let totalRecords = await InvoicesTally.countDocuments({ ...queryPayload }).lean();
        return {
            records,
            totalRecords
        }
    };


    async getCustomerSalesman(customerId){
       
        //  {$project:{"salesman.employeeId":1,"salesman.fullName":1}}]
       let aggr=[  
        {$match:{  customerId:  mongoose.Types.ObjectId(customerId),
        isInvoiceMapped: true, isCollectionMade: true}},
       {$group: {_id: "$customerId",     
        
        salesmanIds: { $addToSet:"$salesmanId" }}
           
       },
      {$unwind:{
             path: "$salesmanIds",
         
      }}
      ,
      
      {$lookup:{
          from:"salesmanagers",
        let:{id:'$salesmanIds'},
        pipeline:[
          {$match:{
             
                     
                        $expr:{$eq: ['$_id','$$id']}
                    
                    }} 
            
        ],as:"salesman"}},
        {$unwind:{
             path: "$salesman",
         
      }}
      ,
        {$project:{_id:0,"salesman.employeeId":1,"salesman.fullName":1}}
      ]
        return CollectionModel.aggregate(aggr)
        
    }

    async getPaymentReport(fromDate,toDate){
      return CollectionModel.aggregate([
        { $sort: { updatedAt: -1 } },
        {
          $match: {
            postToSAPStatus: {
              $in: [
                "Connection Timed Out",
                "Fully Processed",
                "Not Processed",
                "Partially Processed",
                "SAP API Failure",
                "Sap Server Error 500",
                "postedManually",
              ],
            },
            updatedAt: {
              $lte: toDate,
              $gte: fromDate,
            },
            isInvoiceMapped: true,
            isCollectionMade: true,
            isDeleted: 0,
            status: 1,
          },
        },
        {
          $lookup: {
            from: "salesmanagers",
            let: {
              id: "$salesmanId",
            },
            pipeline: [
              {
                $match: {
                  status: 1,
                  isDeleted: 0,
                  $expr: {
                    $eq: ["$_id", "$$id"],
                  },
                },
              },
              {
                $lookup: {
                  from: "distributors",
                  let: {
                    id: "$warehouseId",
                  },
                  pipeline: [
                    {
                      $match: {
                        status: 1,
                        isDeleted: 0,
                        $expr: {
                          $and: [{ $eq: ["$_id", "$$id"] }],
                        },
                      },
                    },
                    {
                      $project: {
                        distributorId: "$_id",
                        distributorName: "$nameToDisplay",
                        warehouseId: 1,
                        warehouseName: "$nameToDisplay",
                        salesOrg: 1,
                        nameToDisplay: 1,
                        distributionChannel: 1,
                        plant: 1,
                      },
                    },
                  ],
                  as: "distributors",
                },
              },
              {
                $unwind: {
                  path: "$distributors",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  employeeId: 1,
                  fullName: 1,
                  distributors: 1,
                },
              },
            ],
            as: "salesmangers",
          },
        },
        {
          $unwind: {
            path: "$salesmangers",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $unwind: {
            path: "$invoicesMapped",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "dmsInputData",
            localField: "invoicesMapped.invoice#",
            foreignField: "invoiceId",
            as: "data",
          },
        },
        {
          $unwind: {
            path: "$data",
          },
        },
        {
          $project: {
            customerId: "$customer.goFrugalId",
            customerName: "$customer.customerName",
            collectionId: "$collectionSequence",
            collectionDate:"$collectionDate",
            salesmanId: "$salesmangers.employeeId",
            salesmanName: "$salesmangers.fullName",
            invoiceNo: "$invoicesMapped.invoice#",
            distributorName: "$salesmangers.distributors.nameToDisplay",
            invoiceAmount: "$data.totalAmount",
            distributor: "$salesmangers.distributors.distributionChannel",
            salesOrg: "$salesmangers.distributors.salesOrg",
            plant: "$salesmangers.distributors.plant",
            pendingAmount: "$data.outstanding",
            paymentAmount: "$invoicesMapped.amount",
            sapStatus: "$postToSAPStatus",
            sapResopnse: "$sapResponse",
            glAccount: "$glAccount",
            status: "$stage.state",
            dateOfPosting: "$updatedAt",
            invoiceStatus: "$invoicesMapped.postStatus",
            collectionMode: "$type",
            demandDraft:1,
            cheque:1,
            online:1,
            cash:1
          },
        },
      ]).allowDiskUse(true);;
  }

//get collecction report data

async getCollectionReport(fromDate,toDate){
  return CollectionModel.aggregate([
    { $sort: { updatedAt: -1 } },
    {
      $match: {
        overAllStatus: { $ne: "rejected" },
        collectionDate: {
          $lte: toDate,
          $gte: fromDate,
        },
        isInvoiceMapped: true,
        isCollectionMade: true,
        isDeleted: 0,
        status: 1,
      },
    },
    {
      $lookup: {
        from: "salesmanagers",
        let: {
          id: "$salesmanId",
        },
        pipeline: [
          {
            $match: {
              status: 1,
              isDeleted: 0,
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
          {
            $lookup: {
              from: "distributors",
              let: {
                id: "$warehouseId",
              },
              pipeline: [
                {
                  $match: {
                    status: 1,
                    isDeleted: 0,
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$id"] }],
                    },
                  },
                },
                {
                  $project: {
                    distributorId: "$_id",
                    distributorName: "$nameToDisplay",
                    warehouseId: 1,
                    warehouseName: "$nameToDisplay",
                     nameToDisplay: 1,
                    plant: 1,
                  },
                },
              ],
              as: "distributors",
            },
          },
          {
            $unwind: {
              path: "$distributors",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              employeeId: 1,
              fullName: 1,
              distributors: 1,
            },
          },
        ],
        as: "salesmangers",
      },
    },
    {
      $unwind: {
        path: "$salesmangers",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $unwind: {
        path: "$invoicesMapped",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "dmsInputData",
        localField: "invoicesMapped.invoice#",
        foreignField: "invoiceId",
        as: "data",
      },
    },
    {
      $unwind: {
        path: "$data",
      },
    },
    {
      $project: {
        customerId: "$customer.goFrugalId",
        customerName: "$customer.customerName",
        collectionId: "$collectionSequence",
        collectionDate:"$collectionDate",
        salesmanId: "$salesmangers.employeeId",
        salesmanName: "$salesmangers.fullName",
        collectionAmount:"$collectionAmount",
        distributorName: "$salesmangers.distributors.nameToDisplay",
        invoiceNo: "$invoicesMapped.invoice#",
        invoiceMappedArray:"$invoicesMapped",
        plant: "$salesmangers.distributors.plant",
        collectionStatus: "$stage.state",
        collectionMode: "$type",
        collectionDoneBy:"$collectionDoneBy",
        demandDraft:1,
        cheque:1,
        online:1,
        cash:1
       
      },
    },
  ]).allowDiskUse(true);;
}
async getBulkSubmitted(startingDate,endingDate,user,mode){
  console.log(startingDate,endingDate)
  let findQuery= {
    
    isBulkUpload:"1",
    FCEmployeeId:user.empId,
    createdAt:{$gt:startingDate,$lte:endingDate}
   }
   if(mode=='cash'){
     findQuery.type=mode
   }if(mode=='nonCash'){
     findQuery={
       ...findQuery,
       type:{'$in':["cheque","online","dd","demandDraft"]
     }
   }}
  
  return await CollectionModel.find({...findQuery}
  ,{collectionDate:1,customer:1,employeeName:1,plant:1,distributor:1,collectionAmount:1,invoicesMapped:1}
  )

}
async getSubmittedRecords(batchNo){
  let getRecords = await CollectionModel.aggregate([
    {
      $match:{
        batchNo:batchNo,
        isBulkUpload:{$exists:false}
      }
    },
    {
      $project:{
       collectionDate:1,
       customer:1,
       employeeName:1,
       employeeId:1,
       plant:1,
       distributor:1,
       collectionAmount:1,
       invoicesMapped:1
      }
    }
  ])
  return getRecords
}
async paginate(item,page,limit){
  let skip = (page - 1) * limit
  let SubmittedData = item.slice(skip).slice(0, limit)
  let total_pages = Math.ceil(item.length / limit);
  return { SubmittedData, total_pages}
}
}


module.exports = new CollectionQuery();