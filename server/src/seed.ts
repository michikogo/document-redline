import db from "./db";
import { documents, changes } from "./schema";

const now = new Date().toISOString();

const docs = [
  {
    id: crypto.randomUUID(),
    title: "Non-Disclosure Agreement",
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of January 1, 2026, by and between Acme Corp, a Delaware corporation ("Disclosing Party"), and Licensee, a California limited liability company ("Receiving Party").

1. PURPOSE

The Disclosing Party and the Receiving Party (collectively, the "Parties") wish to explore a potential business relationship (the "Purpose"). In connection with the Purpose, the Disclosing Party may disclose to the Receiving Party certain confidential and proprietary information. This Agreement sets forth the terms and conditions under which such information will be disclosed and protected.

2. DEFINITION OF CONFIDENTIAL INFORMATION

For purposes of this Agreement, "Confidential Information" means any and all information or data that has or could have commercial value or other utility in the business in which the Disclosing Party is engaged. If Confidential Information is in written form, the Disclosing Party shall label or stamp the materials with the word "Confidential" or some similar warning. If Confidential Information is transmitted orally, the Disclosing Party shall promptly provide a writing indicating that such oral communication constituted Confidential Information.

Confidential Information includes, without limitation: technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information disclosed by the Disclosing Party either directly or indirectly in writing, orally, or by drawings or inspection of parts or equipment.

3. OBLIGATIONS OF THE RECEIVING PARTY

The Receiving Party agrees to:

(a) Hold the Confidential Information in strict confidence and take all reasonable precautions to protect such Confidential Information, including all precautions the Receiving Party employs with respect to its own confidential materials;

(b) Not disclose any Confidential Information to any third party without the prior written consent of the Disclosing Party;

(c) Not use any Confidential Information for any purpose except to evaluate and engage in discussions concerning the Purpose;

(d) Not copy or reproduce any Confidential Information without the prior written consent of the Disclosing Party;

(e) Promptly notify the Disclosing Party in the event of any unauthorized use or disclosure of the Confidential Information.

4. EXCLUSIONS FROM CONFIDENTIAL INFORMATION

The Receiving Party's obligations under this Agreement do not apply to information that:

(a) Is or becomes publicly available through no act or omission of the Receiving Party;

(b) Was in the Receiving Party's lawful possession prior to the disclosure and had not been obtained by the Receiving Party either directly or indirectly from the Disclosing Party;

(c) Is lawfully disclosed to the Receiving Party by a third party without restriction on disclosure;

(d) Is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information; or

(e) Is required to be disclosed by applicable law, regulation, or court order, provided that the Receiving Party provides the Disclosing Party with prompt written notice of such requirement and cooperates with the Disclosing Party in seeking a protective order.

5. TERM

The obligations of the Receiving Party under this Agreement shall survive termination of any relationship between the Parties and shall remain in effect for a period of five (5) years from the date of disclosure of the relevant Confidential Information.

6. RETURN OF CONFIDENTIAL INFORMATION

Upon the written request of the Disclosing Party, the Receiving Party shall promptly return or destroy all tangible materials embodying Confidential Information, including all copies, reproductions, summaries, analyses, and other materials derived therefrom.

7. NO LICENSE

Nothing in this Agreement shall be construed to grant the Receiving Party any license or right to any Confidential Information, patents, copyrights, trademarks, or other intellectual property rights of the Disclosing Party.

8. REMEDIES

The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages would be inadequate, and the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.

9. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising under this Agreement shall be resolved exclusively in the state or federal courts located in Wilmington, Delaware, and both Parties hereby consent to the personal jurisdiction of such courts.

10. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether oral or written, relating to such subject matter.

IN WITNESS WHEREOF, the Parties have executed this Non-Disclosure Agreement as of the date first written above.

ACME CORP
By: ___________________________
Name: Sarah Mitchell
Title: Chief Executive Officer
Date: January 1, 2026

LICENSEE
By: ___________________________
Name: David Chen
Title: Managing Director
Date: January 1, 2026`,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: crypto.randomUUID(),
    title: "Software License Agreement",
    content: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement (the "Agreement") is entered into as of February 15, 2026, by and between TechVentures Inc., a New York corporation ("Licensor"), and Enterprise Solutions LLC, a Texas limited liability company ("Licensee").

RECITALS

WHEREAS, Licensor has developed certain proprietary software and desires to license such software to Licensee; and

WHEREAS, Licensee desires to obtain a license to use such software in accordance with the terms and conditions set forth herein.

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:

1. DEFINITIONS

1.1 "Software" means the TechVentures Platform, version 4.2, including all modules, updates, upgrades, patches, bug fixes, and related documentation made available to Licensee under this Agreement.

1.2 "Authorized Users" means the employees, contractors, and agents of Licensee who are authorized by Licensee to access and use the Software solely for Licensee's internal business purposes.

1.3 "Documentation" means the user manuals, technical specifications, and other written materials provided by Licensor in connection with the Software.

1.4 "Intellectual Property Rights" means all patents, copyrights, trademarks, trade secrets, and other proprietary rights recognized in any jurisdiction worldwide.

2. GRANT OF LICENSE

2.1 Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive, non-transferable, non-sublicensable license to:

(a) Install and use the Software on Licensee's servers and computing infrastructure;

(b) Allow Authorized Users to access and use the Software solely for Licensee's internal business operations;

(c) Make a reasonable number of copies of the Software solely for backup and archival purposes.

2.2 Licensee acknowledges that the license granted herein is limited solely to the rights expressly set forth in this Section 2 and that no other rights are granted, whether by implication, estoppel, or otherwise.

3. LICENSE RESTRICTIONS

Licensee shall not, and shall ensure that Authorized Users do not:

(a) Copy, modify, translate, adapt, or create derivative works of the Software or Documentation;

(b) Reverse engineer, disassemble, decompile, or otherwise attempt to derive the source code of the Software;

(c) Sell, resell, rent, lease, lend, sublicense, assign, or otherwise transfer the Software or any rights therein to any third party;

(d) Remove, obscure, or alter any proprietary notices, labels, or marks on the Software or Documentation;

(e) Use the Software for the benefit of any third party, including in a service bureau, time-sharing, or outsourcing arrangement;

(f) Use the Software in any manner that violates applicable law or regulation.

4. FEES AND PAYMENT

4.1 In consideration of the license granted herein, Licensee shall pay Licensor an annual license fee of $120,000 (USD), payable in quarterly installments of $30,000 on the first day of each calendar quarter.

4.2 All fees are exclusive of applicable taxes. Licensee shall be responsible for all sales, use, value-added, and other taxes imposed on the transactions contemplated by this Agreement.

4.3 Fees not paid within thirty (30) days of the due date shall accrue interest at the rate of 1.5% per month or the maximum rate permitted by applicable law, whichever is less.

5. INTELLECTUAL PROPERTY

5.1 Licensor retains all right, title, and interest in and to the Software and Documentation, including all Intellectual Property Rights therein. This Agreement does not convey to Licensee any ownership interest in or to the Software or Documentation.

5.2 Licensee shall promptly notify Licensor of any actual or suspected infringement of Licensor's Intellectual Property Rights in the Software of which Licensee becomes aware.

6. CONFIDENTIALITY

6.1 Each Party agrees to keep confidential all Confidential Information of the other Party and not to disclose such Confidential Information to any third party without the prior written consent of the disclosing Party.

6.2 The Receiving Party shall use the Confidential Information solely for the purposes of this Agreement and shall protect the Confidential Information using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.

7. WARRANTIES AND DISCLAIMERS

7.1 Licensor represents and warrants that: (a) it has the right and authority to grant the license set forth herein; (b) the Software will perform materially in accordance with the Documentation for a period of ninety (90) days from the delivery date.

7.2 EXCEPT AS EXPRESSLY SET FORTH IN SECTION 7.1, THE SOFTWARE IS PROVIDED "AS IS" AND LICENSOR MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

8. LIMITATION OF LIABILITY

IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATED TO THIS AGREEMENT, EVEN IF LICENSOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. LICENSOR'S TOTAL LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE FEES PAID BY LICENSEE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

9. INDEMNIFICATION

9.1 Licensor shall indemnify, defend, and hold harmless Licensee and its officers, directors, employees, and agents from and against any claims, damages, losses, and expenses (including reasonable attorneys' fees) arising out of any third-party claim that the Software infringes any patent, copyright, trademark, or trade secret.

9.2 Licensee shall indemnify, defend, and hold harmless Licensor and its officers, directors, employees, and agents from and against any claims, damages, losses, and expenses (including reasonable attorneys' fees) arising out of Licensee's use of the Software in violation of this Agreement.

10. TERM AND TERMINATION

10.1 This Agreement shall commence on the date first written above and shall continue for a period of one (1) year (the "Initial Term"), unless earlier terminated. Thereafter, this Agreement shall automatically renew for successive one-year terms unless either Party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.

10.2 Either Party may terminate this Agreement immediately upon written notice if the other Party materially breaches this Agreement and fails to cure such breach within thirty (30) days of receiving written notice thereof.

10.3 Upon termination or expiration of this Agreement, the license granted herein shall immediately terminate, and Licensee shall promptly uninstall the Software and destroy all copies thereof.

11. GOVERNING LAW AND DISPUTE RESOLUTION

This Agreement shall be governed by the laws of the State of New York. Any dispute arising under this Agreement shall be resolved through binding arbitration administered by the American Arbitration Association in New York City, New York.

12. GENERAL PROVISIONS

12.1 This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof.

12.2 No modification of this Agreement shall be binding unless in writing and signed by authorized representatives of both Parties.

12.3 If any provision of this Agreement is held invalid or unenforceable, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full force and effect.

IN WITNESS WHEREOF, the Parties have executed this Software License Agreement as of the date first written above.

TECHVENTURES INC.
By: ___________________________
Name: Jennifer Walsh
Title: President
Date: February 15, 2026

ENTERPRISE SOLUTIONS LLC
By: ___________________________
Name: Marcus Thompson
Title: Chief Operating Officer
Date: February 15, 2026`,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: crypto.randomUUID(),
    title: "Vendor Services Agreement",
    content: `VENDOR SERVICES AGREEMENT

This Vendor Services Agreement (the "Agreement") is entered into as of March 1, 2026, by and between Global Enterprises Corp., a Washington corporation ("Client"), and Apex Solutions Inc., a Florida corporation ("Vendor").

1. SERVICES

1.1 Vendor shall provide to Client the professional services described in one or more Statements of Work ("SOW") to be executed by the Parties from time to time and incorporated into this Agreement by reference (collectively, the "Services").

1.2 Each SOW shall specify, at a minimum: (a) a description of the Services to be performed; (b) the timeline and milestones for delivery; (c) the fees and payment schedule; (d) any deliverables to be provided; and (e) any other terms specific to that engagement.

1.3 Vendor shall perform the Services in a professional and workmanlike manner, consistent with industry standards, and shall provide sufficient qualified personnel to complete the Services on time and within budget.

2. PERSONNEL

2.1 Vendor shall designate a project manager who shall serve as the primary point of contact for Client and who shall coordinate all aspects of the Services.

2.2 Client may request the removal of any Vendor personnel from the engagement if Client reasonably determines that such personnel are not performing at an acceptable level. Vendor shall use commercially reasonable efforts to replace such personnel within ten (10) business days.

2.3 Vendor personnel are not employees of Client. Vendor is solely responsible for all employment-related obligations, including payment of wages, payroll taxes, benefits, and compliance with applicable employment laws.

3. FEES AND PAYMENT

3.1 Client shall pay Vendor the fees set forth in the applicable SOW. Unless otherwise specified, invoices shall be submitted monthly in arrears and shall be due and payable within thirty (30) days of receipt.

3.2 Vendor shall maintain complete and accurate records of all time and expenses incurred in connection with the Services. Client shall have the right to audit such records upon reasonable notice.

3.3 Vendor shall reimburse Client for any amounts paid that are later determined to have been incorrectly invoiced.

3.4 Disputed invoices shall not affect Vendor's obligation to continue performing the Services. Client shall pay any undisputed portion of an invoice by the due date and provide written notice of any disputed amounts within fifteen (15) days of receipt of the invoice.

4. INTELLECTUAL PROPERTY

4.1 All work product, inventions, discoveries, improvements, software, documentation, and other materials created or developed by Vendor in the performance of the Services ("Work Product") shall be considered works made for hire and shall be the exclusive property of Client.

4.2 To the extent that any Work Product does not qualify as a work made for hire, Vendor hereby irrevocably assigns to Client all right, title, and interest in and to such Work Product, including all Intellectual Property Rights therein.

4.3 Vendor retains ownership of its pre-existing tools, methodologies, and know-how ("Vendor IP"). To the extent that any Vendor IP is incorporated into the Work Product, Vendor grants Client a non-exclusive, perpetual, irrevocable license to use such Vendor IP as part of the Work Product.

5. CONFIDENTIALITY

5.1 Each Party acknowledges that in the course of performing its obligations hereunder, it may have access to confidential and proprietary information of the other Party ("Confidential Information").

5.2 Each Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without the prior written consent of the disclosing Party; and (c) use Confidential Information solely for the purposes of this Agreement.

5.3 The obligations of confidentiality shall survive termination or expiration of this Agreement for a period of three (3) years.

6. REPRESENTATIONS AND WARRANTIES

6.1 Vendor represents and warrants that: (a) it has the full right, power, and authority to enter into and perform this Agreement; (b) the Services will be performed by qualified personnel in a professional and workmanlike manner; (c) the Work Product will not infringe the Intellectual Property Rights of any third party; (d) Vendor will comply with all applicable laws and regulations in performing the Services.

6.2 Client represents and warrants that: (a) it has the full right, power, and authority to enter into and perform this Agreement; (b) it will provide Vendor with timely access to the information, systems, and personnel reasonably necessary for Vendor to perform the Services.

7. INDEMNIFICATION

7.1 Vendor shall indemnify, defend, and hold harmless Client and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) Vendor's breach of any representation, warranty, or obligation under this Agreement; (b) the negligence or willful misconduct of Vendor or its personnel; or (c) any claim that the Work Product infringes the Intellectual Property Rights of any third party.

7.2 Client shall indemnify, defend, and hold harmless Vendor and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) Client's breach of any representation, warranty, or obligation under this Agreement; or (b) the negligence or willful misconduct of Client or its personnel.

8. LIMITATION OF LIABILITY

8.1 NEITHER PARTY SHALL BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATED TO THIS AGREEMENT, EVEN IF SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

8.2 EACH PARTY'S TOTAL LIABILITY TO THE OTHER UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY CLIENT TO VENDOR IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.

9. TERM AND TERMINATION

9.1 This Agreement shall commence on the date first written above and shall continue until terminated by either Party in accordance with this Section 9.

9.2 Either Party may terminate this Agreement for convenience upon thirty (30) days' prior written notice to the other Party.

9.3 Either Party may terminate this Agreement immediately upon written notice if the other Party: (a) materially breaches this Agreement and fails to cure such breach within fifteen (15) days of receiving written notice thereof; (b) becomes insolvent or makes an assignment for the benefit of creditors; or (c) is subject to bankruptcy, receivership, or similar proceedings.

9.4 Upon termination or expiration of this Agreement: (a) each Party shall promptly return or destroy all Confidential Information of the other Party; (b) Client shall pay Vendor for all Services performed and expenses incurred prior to the effective date of termination; (c) Vendor shall promptly deliver to Client all Work Product completed or in progress as of the termination date.

10. DISPUTE RESOLUTION

10.1 The Parties shall attempt to resolve any dispute arising under this Agreement through good faith negotiation between senior representatives of each Party.

10.2 If the Parties are unable to resolve a dispute through negotiation within thirty (30) days, either Party may submit the dispute to mediation administered by JAMS in Seattle, Washington.

10.3 If mediation is unsuccessful, either Party may pursue its rights and remedies in the state or federal courts located in King County, Washington.

11. GENERAL PROVISIONS

11.1 Governing Law. This Agreement shall be governed by the laws of the State of Washington, without regard to its conflict of law provisions.

11.2 Entire Agreement. This Agreement, together with all SOWs, constitutes the entire agreement between the Parties and supersedes all prior negotiations, representations, warranties, and understandings.

11.3 Amendment. No amendment to this Agreement shall be binding unless made in writing and signed by authorized representatives of both Parties.

11.4 Waiver. No waiver of any provision of this Agreement shall be effective unless in writing. No waiver shall be deemed a continuing waiver or a waiver of any other provision.

11.5 Severability. If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be reformed to the minimum extent necessary to make it valid and enforceable, and the validity and enforceability of all other provisions shall not be affected.

11.6 Force Majeure. Neither Party shall be liable for any delay or failure to perform its obligations under this Agreement due to causes beyond its reasonable control, including acts of God, natural disasters, war, terrorism, government actions, or labor disputes.

11.7 Notices. All notices under this Agreement shall be in writing and delivered by email with confirmation of receipt, overnight courier, or certified mail to the addresses set forth in the applicable SOW.

IN WITNESS WHEREOF, the Parties have executed this Vendor Services Agreement as of the date first written above.

GLOBAL ENTERPRISES CORP.
By: ___________________________
Name: Patricia Reynolds
Title: Vice President, Procurement
Date: March 1, 2026

APEX SOLUTIONS INC.
By: ___________________________
Name: Robert Kim
Title: Chief Executive Officer
Date: March 1, 2026`,
    version: 1,
    created_at: now,
    updated_at: now,
  },
];

db.delete(changes).run();
db.delete(documents).run();

for (const doc of docs) {
  db.insert(documents).values(doc).run();
}

console.log(`Seeded ${docs.length} documents.`);
