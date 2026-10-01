// Transactional notification email simulation (Nodemailer compatible)

export const emailService = {
  async sendOrderPlaced(to: string, token: string, itemsCount: number, total: number) {
    console.log(`[Email Service] Sent ORDER_PLACED to ${to}: Token ${token} for Rs. ${total} (${itemsCount} items)`);
    return true;
  },

  async sendOrderReady(to: string, token: string) {
    console.log(`[Email Service] Sent ORDER_READY to ${to}: Token ${token} is ready at pickup counter!`);
    return true;
  },

  async sendVerification(to: string, link: string) {
    console.log(`[Email Service] Sent EMAIL_VERIFICATION to ${to}: ${link}`);
    return true;
  },

  async sendPasswordReset(to: string, link: string) {
    console.log(`[Email Service] Sent PASSWORD_RESET to ${to}: ${link}`);
    return true;
  }
};
