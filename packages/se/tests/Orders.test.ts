import { User } from "../src/User/User";
import { Stock } from "../src/util/Datatypes";
import { OrderType, OrderStatus } from "../src/Order/Order";
import { Market } from "../src/Market/Market";

beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Market.instance = new Market();
    Market.getInstance().addOrderStore(Stock.TSLA);
});

it("Simple Buy, Sell - Settled", () => {
    const user1 = new User("John Doe", 0, [{ stock: Stock.TSLA, quantity: 5 }]);
    const user2 = new User("Mary Jane", 100);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 20);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Placed);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 5, 20);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Confirmed);
});

it("Simple Sell, Buy - Settled", () => {
    const user1 = new User("John Doe", 0, [{ stock: Stock.TSLA, quantity: 5 }]);
    const user2 = new User("Mary Jane", 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 5, 20);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Placed);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 20);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Confirmed);
});

it("Simple Sell, Buy - Partially Settled", () => {
    const user1 = new User("John Doe", 0, [{ stock: Stock.TSLA, quantity: 5 }]);
    const user2 = new User("Mary Jane", 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 10, 10);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 10);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Placed);
    expect(order2.order?.getQuantitySettled()).toBe(5);
});

it("Buy order settled by 2 sell orders", () => {
    const user1 = new User("John Doe", 0, [{ stock: Stock.TSLA, quantity: 10 }]);
    const user2 = new User("Mary Jane", 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 10, 10);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 10);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Placed);
    expect(order2.order?.getQuantitySettled()).toBe(5);

    const order3 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 10);
    expect(order3.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Confirmed);
});

it("Sell order settled by 2 buy orders", () => {
    const user1 = new User("John Doe", 0, [{ stock: Stock.TSLA, quantity: 10 }]);
    const user2 = new User("Mary Jane", 100);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 10, 10);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 5, 10);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Placed);
    expect(order1.order?.getQuantitySettled()).toBe(5);

    const order3 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 5, 10);
    expect(order3.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Confirmed);
});

it("Buy order settled by 2 sell orders(with different avg. prices)", () => {
    const user1 = new User("John Doe", 0, [{ stock: Stock.TSLA, quantity: 10 }]);
    const user2 = new User("Mary Jane", 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 10, 10);

    const order3 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 5);
    expect(order3.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Placed);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 12);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Confirmed);
});

it("Buy order settled by 2 sell orders(with different avg. prices), higher price order first.", () => {
    const user1 = new User("John Doe", 0, [{ stock: Stock.TSLA, quantity: 10 }]);
    const user2 = new User("Mary Jane", 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, 10, 10);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 12);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Placed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Placed);

    const order3 = user1.placeOrder(Stock.TSLA, OrderType.Sell, 5, 5);
    expect(order3.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order2.order?.getStatus()).toBe(OrderStatus.Confirmed);
    expect(order1.order?.getStatus()).toBe(OrderStatus.Confirmed);
});
