"use strict";

const { ServiceBroker, Errors } = require("moleculer");

const dbServiceMixin = require("./dbServiceMixin");
const CloudFirestoreAdapter = require("./adapters/CloudFirestore");
const { ValidationError } = Errors;

describe("dbServiceMixin", () => {
  const broker = new ServiceBroker({ logger: false });
  const adapter = new CloudFirestoreAdapter("apiKey", "projectId");
  const service = broker.createService({
    name: "posts",
    mixins: [dbServiceMixin],
    adapter,
    collection: "posts",
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());
  afterEach(() => jest.clearAllMocks());

  describe("get", () => {
    it("should throw a ValidationError if 'get' method isn't passed a string or an array of strings", async () => {
      try {
        await broker.call("posts.get");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });

    it("should throw a TypeError if 'get' method is passed an ID that is not either a string or an array of strings", async () => {
      try {
        await broker.call("posts.get", { id: 123 });
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
      }
    });

    it("should call 'get' method if id parameter is a string", async () => {
      jest.spyOn(service, "findByIds");

      const mockedDoc = { id: "1", name: "a document with ID '1'" };
      const mockedGetFn = jest.fn(async () => mockedDoc);

      service.get = mockedGetFn;

      const foundDoc = await broker.call("posts.get", { id: "1" });
      expect(foundDoc).toBe(mockedDoc);
      expect(mockedGetFn).toBeCalledTimes(1);
      expect(mockedGetFn).toHaveBeenCalled();
      expect(service.findByIds).not.toHaveBeenCalled();
    });

    it("should call 'findByIds' method if id parameter is an array of strings", async () => {
      jest.spyOn(service, "get");

      const mockedDocs = [
        { id: "1", name: "a document with ID '1'" },
        { id: "2", name: "another one" },
      ];
      const mockedFindByIdsFn = jest.fn(async () => mockedDocs);

      service.findByIds = mockedFindByIdsFn;

      const foundDocs = await broker.call("posts.get", { id: ["1", "2"] });
      expect(foundDocs).toBe(mockedDocs);
      expect(mockedFindByIdsFn).toHaveBeenCalled();
      expect(mockedFindByIdsFn).toBeCalledTimes(1);
      expect(service.get).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    jest.spyOn(service, "list");

    const mockedAllDocs = [
      { id: "1", name: "a document with ID '1'" },
      { id: "2", name: "another one" },
    ];
    const mockedGetAllFn = jest.fn(async () => mockedAllDocs);

    service.getAll = mockedGetAllFn;

    it("should return all documents if neither 'next' nor 'orderBy' parameters are passsed", async () => {
      const allDocs = await broker.call("posts.list");
      expect(allDocs).toBe(mockedAllDocs);
      expect(mockedGetAllFn).toHaveBeenCalled();
      expect(mockedGetAllFn).toBeCalledTimes(1);
      expect(service.list).not.toHaveBeenCalled();
    });

    it("should throw an error if 'orderBy' is of an invalid type", async () => {
      // TODO implement me
    });

    it("should return sorted results if 'orderBy' parameter is passed", async () => {
      // TODO implement me
    });

    it("should throw an error if 'next' is of an invalid type", async () => {
      // TODO implement me
    });

    it("should return paginated results if 'next' parameter is passed", async () => {
      // TODO implement me
    });
  });
});
