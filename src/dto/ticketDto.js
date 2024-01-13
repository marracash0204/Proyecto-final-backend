class TicketDTO {
  constructor(code, purchase_timedate, amount, purchaser) {
    this.code = code;
    this.purchase_timedate = purchase_timedate;
    this.amount = amount;
    this.purchaser = purchaser;
  }

  static fromModel(ticketModel) {
    const { code, purchase_timedate, amount, purchaser } = ticketModel;
    return new TicketDTO(code, purchase_timedate, amount, purchaser);
  }
}

export { TicketDTO };
