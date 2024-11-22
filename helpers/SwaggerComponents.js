// swaggerComponents.js

const swaggerComponents = {
  parameters: {
    CategoryId: {
      in: 'query',
      name: 'CategoryId',
      schema: {
        type: 'string'
      },
      required: true,
      description: 'Data fetching based on CategoryId.'
    },
    SubCategoryId: {
      in:'query',
      name:'SubCategoryId',
      Schema: {
        type: 'string'
      },
      required:true,
      description: 'Data fetching based on SubCategoryId.'
    },
    BuyerId: {
      in:"query",
      name:"BuyerId",
      Schema: {
        type: 'string'
      },
      required:true,
      description: 'Data fetching based on BuyerId.'
    },
    UserId:{
      in:"query",
      name:"UserId",
      Schema:{
        type:'string'
      },
      required:true,
      description: 'Data fetching based on UserId'
    },
    SellerId: {
      in:"query",
      name:"SellerId",
      Schema:{
        type:'string'
      },
      required:true,
      description: 'Data fetching based on SellerId'
    },
    ListingId: {
      in: 'query',
      name: 'ListingId',
      schema: {
        type: 'integer'
      },
      required: true,
      description: 'ID of the property to retrieve details.'
    },
    BrandId: {
      in: 'query',
      name: 'BrandId',
      schema: {
        type: 'integer'
      },         
      required: true,
      description: 'ID of the brand to retrieve Brand name'
    },
    IsPaid: {
      in: 'query',
      name: 'IsPaid',
      schema: {
        type: 'integer',
        enum: [0, 1]
      },
      required: true,
      description: 'Data fetching based on IsPaid.'
    }
  },
  requestBodies: {
    ListingRequestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              SubCategoryId: {
                type: 'string',
                example: '12,13'
              },
              CurrentCondition: {
                type: 'integer',
                example: 0
              },
              MinPrice: {
                type: 'integer',
                example: 0
              },
              MaxPrice: {
                type: 'integer',
                example: 0
              },
              OrderByOption: {
                type: 'integer',
                description: 'Order by option: 1 - Latest, 2 - Oldest, 3 - Price high to low, 4 - Price low to high',
                example: 1
              }
            }
          }
        }
      }
    },
    SearchRequestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              Location: {
                type: 'string',
                example: 'NULL'
              },
              CurrentCondition: {
                type: 'integer',
                example: 0
              },
              Price: {
                type: 'integer',
                example: 0
              },
              Quantity: {
                type: 'integer',
                example: 0
              },
              CategoryId: {
                type: 'integer',
                example:0
              },
              SubCategoryId: {
                type: 'integer',
                example:0
              },
              Keywords: {
                type: 'string',
                example: 'NULL'
              }
            }
          }
        }
      }
    },
    SignUp:{
      required: true,
      content: {
        'application/json': {
          schema: {
            type:'object',
            properties: {
              UserName:{
                type:'string',
                example:'John'
              },
              RoleId:{
                type:'integer',
                example:2
              },
              Email:{
                type:'string',
                example:'john@example.com'
              },
              Password:{
                type:'string',
                example:'john@example.com'
              },
              FirstName:{
                type:'string',
                example:'john'
              },
              LastName:{
                type:'string',
                example:'john'
              },
              CreatedBy:{
                type:'integer',
                example:1
              }
            }
          }
        }
      }

    },
    ForgotPassword: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              Email: {
                type: 'string',
                example: 'Venky@perennialcode.in'
              },
              Password: {
                type: 'string',
                example: 1234
              }
            }
          }
        }
      }
    },
    Jsondata:{
      required:true,
      content: {
        'application/json': {
          schema: {
            type: 'object'
          }
        }
      }
    }

  },
  responses: {
    SuccessResponse: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string'
              },
              data: {
                type: 'object'
              }
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerComponents;
